"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  PieChart as PieIcon,
  Eye,
  ShoppingCart,
  Euro,
} from "lucide-react";

// Paleolitho color palette for charts
const CHART_COLORS = [
  "#cd5c3c", // terracotta
  "#d4a76a", // parchemin gold
  "#2d7d72", // teal
  "#5b8fa8", // blue-grey
  "#8b6a8c", // mauve
  "#6a8b5b", // sage
  "#c9834a", // amber
  "#7a6b8a", // purple
];

interface MonthlyRevenue {
  month: string;
  total: number;
}

interface SalesByCategory {
  name: string;
  value: number;
}

interface TopArticle {
  id: string;
  title: string;
  views: number;
  slug: string;
}

interface MonthlyOrder {
  month: string;
  count: number;
}

interface AdminStatsProps {
  monthlyRevenue: MonthlyRevenue[];
  salesByCategory: SalesByCategory[];
  topArticles: TopArticle[];
  monthlyOrders: MonthlyOrder[];
  lang: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EuroTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-xl">
        <p className="text-slate-300 mb-1">{label}</p>
        <p className="text-terracotta font-bold">
          {payload[0].value.toLocaleString("fr-FR")} €
        </p>
      </div>
    );
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CountTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-xl">
        <p className="text-slate-300 mb-1">{label}</p>
        <p className="text-blue-400 font-bold">
          {payload[0].value} commande{payload[0].value > 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// Category display names
const CATEGORY_LABELS: Record<string, string> = {
  TRILOBITE: "Trilobites",
  AMMONITE: "Ammonites",
  DENT: "Dents",
  ECHINODERME: "Échinodermes",
  POISSON: "Poissons",
  VERTEBRE: "Vertébrés",
  GASTEROPODE: "Gastéropodes",
  AUTRE_ARTHROPODE: "Arthropodes",
  AUTRES: "Autres",
};

export default function AdminStats({
  monthlyRevenue,
  salesByCategory,
  topArticles,
  monthlyOrders,
  lang,
}: AdminStatsProps) {
  const hasRevenue = monthlyRevenue.some((m) => m.total > 0);
  const hasOrders = monthlyOrders.some((m) => m.count > 0);
  const hasCategories = salesByCategory.length > 0;
  const hasArticles = topArticles.length > 0;

  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.total, 0);
  const totalOrders = monthlyOrders.reduce((s, m) => s + m.count, 0);

  // Show only last 6 months for readability
  const revenueSlice = monthlyRevenue.slice(-6);
  const ordersSlice = monthlyOrders.slice(-6);

  const categoryData = salesByCategory.map((c) => ({
    ...c,
    name: CATEGORY_LABELS[c.name] ?? c.name,
  }));

  return (
    <div className="space-y-6">
      {/* KPIs row */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-terracotta/10 to-terracotta/5 border-terracotta/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Euro className="w-8 h-8 text-terracotta flex-shrink-0" />
            <div>
              <p className="text-xl font-bold text-parchemin">
                {totalRevenue.toLocaleString("fr-FR")} €
              </p>
              <p className="text-xs text-muted-foreground">Revenus (12 mois)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-xl font-bold text-parchemin">{totalOrders}</p>
              <p className="text-xs text-muted-foreground">Commandes (12 mois)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue bar chart */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-parchemin text-base">
            <TrendingUp className="w-4 h-4 text-terracotta" />
            Revenus mensuels (6 derniers mois)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasRevenue ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueSlice} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) => v.split(" ")[0]}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${v}€`}
                />
                <Tooltip content={<EuroTooltip />} />
                <Bar dataKey="total" fill="#cd5c3c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Aucun revenu enregistré pour cette période." />
          )}
        </CardContent>
      </Card>

      {/* Orders line chart */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-parchemin text-base">
            <ShoppingCart className="w-4 h-4 text-blue-400" />
            Commandes par mois (6 derniers mois)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasOrders ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={ordersSlice} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) => v.split(" ")[0]}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CountTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={{ fill: "#60a5fa", r: 4 }}
                  activeDot={{ r: 6, fill: "#60a5fa" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Aucune commande pour cette période." />
          )}
        </CardContent>
      </Card>

      {/* Sales by category */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-parchemin text-base">
            <PieIcon className="w-4 h-4 text-amber-400" />
            Ventes par catégorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasCategories ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  labelLine={false}
                  label={PieCustomLabel}
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  formatter={(value: string) => (
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>{value}</span>
                  )}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `${value} vente${value > 1 ? "s" : ""}`,
                    "Quantité",
                  ]}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Aucune vente enregistrée par catégorie." />
          )}
        </CardContent>
      </Card>

      {/* Top articles */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-parchemin text-base">
            <Eye className="w-4 h-4 text-purple-400" />
            Articles les plus lus
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasArticles ? (
            <div className="space-y-3">
              {topArticles.map((article, i) => (
                <div
                  key={article.id}
                  className="flex items-center gap-3"
                >
                  <span className="text-2xl font-black text-slate-600 w-7 text-right flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-parchemin truncate">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Eye className="w-3 h-3 text-purple-400" />
                      <span className="text-xs text-muted-foreground">
                        {article.views.toLocaleString("fr-FR")} vues
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs flex-shrink-0">
                    #{i + 1}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyChart message="Aucun article publié." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm italic">
      {message}
    </div>
  );
}
