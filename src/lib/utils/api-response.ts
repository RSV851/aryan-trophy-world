import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function successResponse<T>(
  data: T,
  message: string = "Success",
  statusCode: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status: statusCode }
  );
}

export function errorResponse(
  message: string = "An error occurred",
  statusCode: number = 400,
  errors: any = null
) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(errors && { errors }),
    },
    { status: statusCode }
  );
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = "Data retrieved successfully"
) {
  const totalPages = Math.ceil(total / limit) || 1;
  return NextResponse.json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}
