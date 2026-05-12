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

type RequestStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

interface FossilRequestStatusEmailProps {
  customerName: string;
  fossilType: string;
  newStatus: RequestStatus;
  responseMessage?: string | null;
  requestId: string;
  dashboardUrl: string;
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "En attente",
  IN_PROGRESS: "En cours de traitement",
  COMPLETED: "Complétée",
  REJECTED: "Rejetée",
  CANCELLED: "Annulée",
};

const STATUS_COLORS: Record<RequestStatus, string> = {
  PENDING: "#92400e",
  IN_PROGRESS: "#1d4ed8",
  COMPLETED: "#166534",
  REJECTED: "#991b1b",
  CANCELLED: "#374151",
};

export function FossilRequestStatusEmail({
  customerName,
  fossilType,
  newStatus,
  responseMessage,
  dashboardUrl,
}: FossilRequestStatusEmailProps) {
  const statusLabel = STATUS_LABELS[newStatus];
  const statusColor = STATUS_COLORS[newStatus];

  return (
    <Html>
      <Head />
      <Preview>
        Mise à jour de votre demande de fossile — {statusLabel}
      </Preview>
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
              Votre demande de fossile
            </Text>
          </Section>

          {/* Content */}
          <Section style={{ padding: "40px" }}>
            <Heading
              style={{
                color: "#111827",
                fontSize: "22px",
                fontWeight: "700",
                margin: "0 0 16px",
              }}
            >
              Bonjour {customerName},
            </Heading>

            <Text style={{ color: "#374151", fontSize: "16px", lineHeight: "1.6" }}>
              Votre demande concernant{" "}
              <strong>&laquo; {fossilType} &raquo;</strong> vient d&apos;être mise à jour.
            </Text>

            {/* Status badge */}
            <Section style={{ textAlign: "center" as const, margin: "28px 0" }}>
              <Text
                style={{
                  display: "inline-block",
                  backgroundColor: statusColor,
                  color: "#ffffff",
                  padding: "10px 28px",
                  borderRadius: "99px",
                  fontSize: "15px",
                  fontWeight: "700",
                  letterSpacing: "0.5px",
                }}
              >
                {statusLabel}
              </Text>
            </Section>

            {/* Response message */}
            {responseMessage && (
              <>
                <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: "13px",
                    fontWeight: "600",
                    textTransform: "uppercase" as const,
                    letterSpacing: "1px",
                    margin: "0 0 8px",
                  }}
                >
                  Message de notre équipe
                </Text>
                <Section
                  style={{
                    backgroundColor: "#f9fafb",
                    borderLeft: "4px solid #d4a76a",
                    padding: "16px 20px",
                    borderRadius: "0 8px 8px 0",
                  }}
                >
                  <Text
                    style={{
                      color: "#374151",
                      fontSize: "15px",
                      lineHeight: "1.6",
                      margin: 0,
                    }}
                  >
                    {responseMessage}
                  </Text>
                </Section>
              </>
            )}

            <Hr style={{ borderColor: "#e5e7eb", margin: "28px 0" }} />

            <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "1.6" }}>
              Vous pouvez suivre l&apos;évolution de votre demande directement depuis votre tableau de bord.
            </Text>

            <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
              <Link
                href={dashboardUrl}
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
                Voir ma demande
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
            <Text
              style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}
            >
              Paleolitho · Fossiles authentiques · Ne pas répondre à cet email
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
