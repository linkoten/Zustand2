import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
  Link,
} from "@react-email/components";

interface OrderConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  orderTotal: string;
  orderItems: Array<{
    name: string;
    price: string;
    quantity: number;
  }>;
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    postal_code: string;
    country: string;
  };
}

export function OrderConfirmationEmail({
  customerName,
  orderNumber,
  orderTotal,
  orderItems,
  shippingAddress,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirmation de votre commande #{orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🦕 Fossiles & Merveilles</Heading>
            <Text style={subtitle}>Confirmation de commande</Text>
          </Section>

          {/* Greeting */}
          <Section>
            <Text style={text}>Bonjour {customerName},</Text>
            <Text style={text}>
              Merci pour votre commande ! Nous avons bien reçu votre paiement et
              votre commande est en cours de préparation.
            </Text>
          </Section>

          {/* Order Summary */}
          <Section style={orderSection}>
            <Heading style={h2}>Résumé de votre commande</Heading>
            <Text style={orderNumberStyle}>Commande #{orderNumber}</Text>

            {orderItems.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemName}>
                  <Text style={itemText}>{item.name}</Text>
                  <Text style={quantity}>Quantité: {item.quantity}</Text>
                </Column>
                <Column style={itemPrice}>
                  <Text style={price}>{item.price}</Text>
                </Column>
              </Row>
            ))}

            <Hr style={hr} />
            <Row style={totalRow}>
              <Column>
                <Text style={totalText}>Total</Text>
              </Column>
              <Column>
                <Text style={totalPrice}>{orderTotal}</Text>
              </Column>
            </Row>
          </Section>

          {/* Shipping Address */}
          <Section style={shippingSection}>
            <Heading style={h2}>Adresse de livraison</Heading>
            <Text style={address}>
              {shippingAddress.name}
              <br />
              {shippingAddress.line1}
              <br />
              {shippingAddress.postal_code} {shippingAddress.city}
              <br />
              {shippingAddress.country}
            </Text>
          </Section>

          {/* Next Steps */}
          <Section>
            <Heading style={h2}>Prochaines étapes</Heading>
            <Text style={text}>
              • Votre commande sera préparée et expédiée sous 2-3 jours ouvrés
              <br />
              • Vous recevrez un email avec le numéro de suivi dès
              l&apos;expédition
              <br />• La livraison prend généralement 3-5 jours ouvrés
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Des questions ? Contactez-nous à{" "}
              <Link href="mailto:support@votre-domaine.com" style={link}>
                support@votre-domaine.com
              </Link>
            </Text>
            <Text style={footerText}>
              Merci de votre confiance !<br />
              L&apos;équipe Fossiles & Merveilles
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ✅ Styles corrigés avec des objets JavaScript valides
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const header = {
  padding: "32px 24px",
  textAlign: "center" as const,
  backgroundColor: "#f8f9fa",
};

const h1 = {
  color: "#1f2937",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 0 8px",
};

const subtitle = {
  color: "#6b7280",
  fontSize: "16px",
  margin: "0",
};

const h2 = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "32px 0 16px",
  padding: "0 24px",
};

const text = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 16px",
  padding: "0 24px",
};

const orderSection = {
  backgroundColor: "#f9fafb",
  padding: "24px",
  margin: "24px",
  borderRadius: "8px",
};

const orderNumberStyle = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const itemRow = {
  padding: "8px 0",
};

const itemName = {
  width: "70%",
};

const itemPrice = {
  width: "30%",
  textAlign: "right" as const,
};

const itemText = {
  color: "#374151",
  fontSize: "14px",
  margin: "0",
};

const quantity = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "4px 0 0",
};

const price = {
  color: "#374151",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "16px 0",
};

const totalRow = {
  padding: "16px 0 0",
};

const totalText = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
};

const totalPrice = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
  textAlign: "right" as const,
};

const shippingSection = {
  padding: "0 24px",
};

const address = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
  padding: "16px",
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
};

const footer = {
  padding: "32px 24px",
  borderTop: "1px solid #e5e7eb",
  marginTop: "32px",
};

const footerText = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "0 0 8px",
  textAlign: "center" as const,
};

const link = {
  color: "#3b82f6",
  textDecoration: "underline",
};
