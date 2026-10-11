import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceKey) {
      return NextResponse.json(
        { error: "Supabase server configuration is incomplete." },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!token) {
      return NextResponse.json(
        { error: "Please sign in as an administrator." },
        { status: 401 }
      );
    }

    // Verify the signed-in user and their admin permissions.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Your session is invalid. Please sign in again." },
        { status: 401 }
      );
    }

    const { data: isAdmin, error: adminError } =
      await userClient.rpc("is_dealstack_admin");

    if (adminError || isAdmin !== true) {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    // This client is server-side only. Never expose its key to the browser.
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: authData, error: usersError } =
      await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) {
      console.error("Customer list error:", usersError.message);
      return NextResponse.json(
        { error: "Unable to load registered customers." },
        { status: 500 }
      );
    }

    const adminEmail = process.env.DEALSTACK_ADMIN_EMAIL?.toLowerCase();

    const customers = (authData?.users ?? [])
      .filter(
        (customer) =>
          customer.email?.toLowerCase() !== adminEmail
      )
      .map((customer) => ({
        id: customer.id,
        name:
          customer.user_metadata?.full_name ||
          customer.user_metadata?.name ||
          "Name not provided",
        email: customer.email ?? "",
        createdAt: customer.created_at,
      }));

    const { data: orders, error: ordersError } = await adminClient
      .from("orders")
      .select("user_id");

    if (ordersError) {
      console.error("Customer order count error:", ordersError.message);
      return NextResponse.json(
        { error: "Customers loaded, but order counts could not be retrieved." },
        { status: 500 }
      );
    }

    const orderCounts = new Map<string, number>();

    for (const order of orders ?? []) {
      if (order.user_id) {
        orderCounts.set(
          order.user_id,
          (orderCounts.get(order.user_id) ?? 0) + 1
        );
      }
    }

    return NextResponse.json({
      customers: customers.map((customer) => ({
        ...customer,
        orders: orderCounts.get(customer.id) ?? 0,
      })),
    });
  } catch (error) {
    console.error("Admin customers API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while loading customers." },
      { status: 500 }
    );
  }
}
