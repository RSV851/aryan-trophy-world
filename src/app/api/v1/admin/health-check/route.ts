import { NextResponse } from 'next/server';
import { db } from '@/db';
import { settings, adminProfile, products, productImages, inquiries } from '@/db/schema';
import { eq, isNull, and, desc, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export interface SystemNotificationItem {
  id: string;
  title: string;
  description: string;
  category: 'storage' | 'inquiry' | 'reminder';
  entityType?: 'setting' | 'profile' | 'product' | 'inquiry';
  entityId?: string;
  fieldName?: string;
  imageUrl?: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  fixUrl: string;
  isDismissable: boolean;
}

export async function GET() {
  try {
    const warnings: SystemNotificationItem[] = [];
    let totalChecked = 0;

    // 1. Audit Site Branding & Homepage Settings
    const allSettings = await db.select().from(settings);
    const settingsMap: Record<string, string> = {};
    allSettings.forEach((s) => {
      if (typeof s.value === 'string' && s.value.trim()) {
        settingsMap[s.key] = s.value.trim();
      }
    });

    const settingsToCheck = [
      { key: 'site_logo', label: 'Site Brand Logo', fixUrl: '/admin/settings?tab=branding' },
      { key: 'hero_banner_image', label: 'Homepage Hero Banner', fixUrl: '/admin/settings?tab=hero' },
      { key: 'about_story_image', label: 'About Story Image', fixUrl: '/admin/settings?tab=about' },
      { key: 'curated_card_1_image', label: 'Curated Card 1 Image', fixUrl: '/admin/settings?tab=curated' },
      { key: 'curated_card_2_image', label: 'Curated Card 2 Image', fixUrl: '/admin/settings?tab=curated' },
      { key: 'curated_card_3_image', label: 'Curated Card 3 Image', fixUrl: '/admin/settings?tab=curated' },
      { key: 'curated_card_4_image', label: 'Curated Card 4 Image', fixUrl: '/admin/settings?tab=curated' },
      { key: 'curated_card_5_image', label: 'Curated Card 5 Image', fixUrl: '/admin/settings?tab=curated' },
      { key: 'curated_card_6_image', label: 'Curated Card 6 Image', fixUrl: '/admin/settings?tab=curated' },
    ];

    for (const item of settingsToCheck) {
      const url = settingsMap[item.key];
      if (url && (url.startsWith('http') || url.startsWith('/'))) {
        totalChecked++;
        const isOk = await verifyUrlLive(url);
        if (!isOk) {
          warnings.push({
            id: `setting_${item.key}_${Date.now()}`,
            title: `Missing Asset: ${item.label}`,
            description: `The image URL for "${item.label}" returns a 404 error from storage. Fallback icon is active.`,
            category: 'storage',
            entityType: 'setting',
            fieldName: item.key,
            imageUrl: url,
            severity: 'critical',
            timestamp: new Date().toISOString(),
            fixUrl: item.fixUrl,
            isDismissable: false,
          });
        }
      }
    }

    // 2. Audit Executive Owner Profile Avatar
    const [profile] = await db.select().from(adminProfile).limit(1);
    if (profile?.avatarUrl && (profile.avatarUrl.startsWith('http') || profile.avatarUrl.startsWith('/'))) {
      totalChecked++;
      const isOk = await verifyUrlLive(profile.avatarUrl);
      if (!isOk) {
        warnings.push({
          id: `profile_avatar_${Date.now()}`,
          title: 'Missing Executive Avatar Photo',
          description: 'The uploaded avatar photo in Business Profile returns a 404 error from storage.',
          category: 'storage',
          entityType: 'profile',
          fieldName: 'avatarUrl',
          imageUrl: profile.avatarUrl,
          severity: 'critical',
          timestamp: new Date().toISOString(),
          fixUrl: '/admin/profile',
          isDismissable: false,
        });
      }
    }

    // 3. Parallel Pool Audit for ALL Active Product Primary Images
    const activeProducts = await db.query.products.findMany({
      where: and(isNull(products.deletedAt), eq(products.isActive, true)),
      limit: 500,
      with: {
        images: {
          where: eq(productImages.isPrimary, true),
          limit: 1,
        },
      },
    });

    const productAudits = activeProducts
      .map((prod) => ({ prod, primaryImg: prod.images[0]?.imageUrl }))
      .filter((p) => p.primaryImg && (p.primaryImg.startsWith('http') || p.primaryImg.startsWith('/')));

    totalChecked += productAudits.length;

    // Execute in parallel batches of 25 for fast response time with 0 server lag
    const batchSize = 25;
    for (let i = 0; i < productAudits.length; i += batchSize) {
      const batch = productAudits.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async ({ prod, primaryImg }) => {
          const isOk = await verifyUrlLive(primaryImg!);
          if (!isOk) {
            warnings.push({
              id: `product_${prod.id}_${Date.now()}`,
              title: `Product Image Missing: ${prod.name}`,
              description: `Primary image for product SKU "${prod.sku || 'N/A'}" returns 404 from storage.`,
              category: 'storage',
              entityType: 'product',
              entityId: prod.id,
              fieldName: 'primaryImage',
              imageUrl: primaryImg,
              severity: 'critical',
              timestamp: new Date().toISOString(),
              fixUrl: `/admin/products/${prod.id}`,
              isDismissable: false,
            });
          }
        })
      );
    }

    // 4. Audit Customer Inquiries Leads (New & Pending Response)
    const newInquiries = await db.query.inquiries.findMany({
      where: or(eq(inquiries.status, 'new'), eq(inquiries.status, 'read')),
      orderBy: [desc(inquiries.createdAt)],
      limit: 20,
    });

    const nowTime = Date.now();
    for (const inq of newInquiries) {
      totalChecked++;
      const isNew = inq.status === 'new';
      const ageHours = Math.floor((nowTime - new Date(inq.createdAt).getTime()) / (1000 * 60 * 60));

      if (isNew) {
        warnings.push({
          id: `inquiry_new_${inq.id}`,
          title: `📬 New Quotation Request: ${inq.name}`,
          description: `Received ${ageHours === 0 ? 'just now' : `${ageHours}h ago`} from ${inq.email}${inq.company ? ` (${inq.company})` : ''}.`,
          category: 'inquiry',
          entityType: 'inquiry',
          entityId: inq.id,
          severity: 'info',
          timestamp: new Date(inq.createdAt).toISOString(),
          fixUrl: `/admin/inquiries/${inq.id}`,
          isDismissable: true,
        });
      } else if (inq.status === 'read' && ageHours > 24) {
        warnings.push({
          id: `inquiry_pending_${inq.id}`,
          title: `⏳ Follow-up Reminder (>24h Pending): ${inq.name}`,
          description: `Customer inquiry received ${Math.floor(ageHours / 24)} day(s) ago is awaiting formal pro-forma quotation response.`,
          category: 'reminder',
          entityType: 'inquiry',
          entityId: inq.id,
          severity: 'warning',
          timestamp: new Date(inq.createdAt).toISOString(),
          fixUrl: `/admin/inquiries/${inq.id}`,
          isDismissable: true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalChecked,
      warningsCount: warnings.length,
      criticalCount: warnings.filter((w) => w.severity === 'critical').length,
      inquiryCount: warnings.filter((w) => w.category === 'inquiry').length,
      reminderCount: warnings.filter((w) => w.category === 'reminder').length,
      warnings,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function verifyUrlLive(url: string): Promise<boolean> {
  try {
    if (url.startsWith('/') && !url.startsWith('//')) return true;

    const separator = url.includes('?') ? '&' : '?';
    const verifyUrl = `${url}${separator}_audit=${Date.now()}`;

    const res = await fetch(verifyUrl, {
      method: 'HEAD',
      headers: { 'User-Agent': 'SystemHealthCheck/1.0' },
      cache: 'no-store',
    });

    if (res.ok) return true;

    const getRes = await fetch(verifyUrl, {
      method: 'GET',
      headers: { Range: 'bytes=0-10' },
      cache: 'no-store',
    });

    return getRes.ok;
  } catch {
    return false;
  }
}
