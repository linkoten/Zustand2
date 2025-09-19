import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, XCircle } from "lucide-react";
import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { clearCartAction } from "@/lib/actions/cart-actions";
import {
  sendAdminNotificationEmail,
  sendOrderConfirmationEmail,
} from "@/components/resend/sendOrderConfirmationEmail";
import { getDictionary } from "../../dictionaries";

interface ReturnPageProps {
  params: Promise<{ lang: "en" | "fr" }>;
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutReturnPage({
  params,
  searchParams,
}: ReturnPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/");
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items", "payment_intent"],
    });

    const { status, customer_details, line_items } = session;
    const customerEmail = customer_details?.email;
    const customerName = customer_details?.name;

    // Redirect if session is still open
    if (status === "open") {
      redirect("/checkout");
    }

    // Payment success
    if (status === "complete") {
      await clearCartAction();

      if (customerEmail && customerName && line_items) {
        try {
          const orderItems = line_items.data.map((item) => ({
            name: item.description || dict.checkoutReturn.itemDefault,
            price: new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US", {
              style: "currency",
              currency: "EUR",
            }).format((item.amount_total || 0) / 100),
            quantity: item.quantity || 1,
          }));

          const emailData = {
            customerEmail,
            customerName,
            orderNumber: session_id.slice(-8).toUpperCase(),
            orderTotal: new Intl.NumberFormat(
              lang === "fr" ? "fr-FR" : "en-US",
              {
                style: "currency",
                currency: "EUR",
              }
            ).format((session.amount_total || 0) / 100),
            orderItems,
            shippingAddress: {
              name: customerName,
              line1:
                customer_details?.address?.line1 ||
                dict.checkoutReturn.addressDefault,
              city:
                customer_details?.address?.city ||
                dict.checkoutReturn.cityDefault,
              postal_code: customer_details?.address?.postal_code || "",
              country:
                customer_details?.address?.country ||
                dict.checkoutReturn.countryDefault,
            },
          };

          await sendOrderConfirmationEmail(emailData);
          await sendAdminNotificationEmail(emailData);
        } catch (emailError) {
          console.error("❌ Email error:", emailError);
        }
      }

      return (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-600">
                  {dict.checkoutReturn.successTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center text-muted-foreground">
                  <p className="mb-2">{dict.checkoutReturn.successMessage}</p>
                  <p>
                    {dict.checkoutReturn.confirmationSent}{" "}
                    <span className="font-medium text-foreground">
                      {customerEmail}
                    </span>
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="font-medium">
                        {dict.checkoutReturn.orderNumberLabel}
                      </span>
                      <p className="text-muted-foreground font-mono text-xs">
                        #{session_id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">
                        {dict.checkoutReturn.orderTotalLabel}
                      </span>
                      <p className="text-muted-foreground">
                        {session.amount_total
                          ? new Intl.NumberFormat(
                              lang === "fr" ? "fr-FR" : "en-US",
                              {
                                style: "currency",
                                currency: "EUR",
                              }
                            ).format(session.amount_total / 100)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>
                    {dict.checkoutReturn.questions}{" "}
                    <a
                      href="mailto:support@votre-domaine.com"
                      className="font-medium text-primary hover:underline"
                    >
                      support@votre-domaine.com
                    </a>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild className="flex-1">
                    <Link href={`/${lang}/fossiles`}>
                      {dict.checkoutReturn.continueShopping}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <Link href={`/${lang}/commandes`}>
                      {dict.checkoutReturn.viewOrders}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Other statuses (expired, etc.)
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl">
                {dict.checkoutReturn.expiredTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-muted-foreground">
                <p>{dict.checkoutReturn.expiredMessage}</p>
              </div>

              <div className="flex justify-center">
                <Button asChild>
                  <Link href={`/${lang}/checkout`}>
                    {dict.checkoutReturn.retryPayment}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Session error:", error);
    redirect("/");
  }
}
