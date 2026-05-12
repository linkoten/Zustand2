import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components";

interface NewsletterEmailProps {
  name?: string;
  subject: string;
  content: string;
  unsubscribeEmail: string;
}

export function NewsletterEmail({
  name,
  subject,
  content,
  unsubscribeEmail,
}: NewsletterEmailProps) {
  // Convert simple newlines to paragraphs for plain-text content
  const paragraphs = content.split(/\n{2,}/).filter(Boolean);

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body
        style={{ backgroundColor: "#f3f4f6", fontFamily: "sans-serif", margin: 0 }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "40px auto",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header */}
          <Section
            style={{
              background: "linear-gradient(135deg, #1a2321 0%, #2d3a37 100%)",
              padding: "32px 40px",
              textAlign: "center" as const,
            }}
          >
            <Text
              style={{
                color: "#d4a76a",
                fontSize: "24px",
                fontWeight: "800",
                margin: 0,
                letterSpacing: "1px",
              }}
            >
              Paleolitho
            </Text>
            <Text
              style={{ color: "#9ca3af", fontSize: "13px", margin: "4px 0 0" }}
            >
              La newsletter des passionnés de fossiles
            </Text>
          </Section>

          {/* Content */}
          <Section style={{ padding: "40px" }}>
            {name && (
              <Heading
                style={{
                  color: "#111827",
                  fontSize: "20px",
                  fontWeight: "700",
                  margin: "0 0 20px",
                }}
              >
                Bonjour {name},
              </Heading>
            )}

            <Heading
              style={{
                color: "#cd5c3c",
                fontSize: "22px",
                fontWeight: "800",
                margin: "0 0 24px",
                lineHeight: "1.3",
              }}
            >
              {subject}
            </Heading>

            {paragraphs.map((para, i) => (
              <Text
                key={i}
                style={{
                  color: "#374151",
                  fontSize: "15px",
                  lineHeight: "1.7",
                  margin: "0 0 16px",
                }}
              >
                {para}
              </Text>
            ))}

            <Hr style={{ borderColor: "#e5e7eb", margin: "28px 0" }} />

            <Section style={{ textAlign: "center" as const }}>
              <Link
                href="https://paleolitho.com/fr/fossiles"
                style={{
                  backgroundColor: "#cd5c3c",
                  color: "#ffffff",
                  padding: "14px 32px",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "700",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Découvrir la collection
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section
            style={{
              backgroundColor: "#f9fafb",
              padding: "20px 40px",
              textAlign: "center" as const,
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <Text style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>
              Paleolitho · Fossiles authentiques
            </Text>
            <Text style={{ color: "#9ca3af", fontSize: "11px", margin: "6px 0 0" }}>
              Vous recevez cet email car vous êtes abonné à notre newsletter.{" "}
              <Link
                href={`https://paleolitho.com/api/newsletter/unsubscribe?email=${encodeURIComponent(unsubscribeEmail)}`}
                style={{ color: "#6b7280", textDecoration: "underline" }}
              >
                Se désabonner
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
