import { Card, CardContent } from "@/components/ui/Card";

export function StatusCard({
  caseId,
  status,
  checksum,
}: {
  caseId: string;
  status: string | null;
  checksum: string | null;
}) {
  return (
    <Card className="mt-6">
      <CardContent className="space-y-2">
        <div className="text-sm"><span className="font-semibold">Case ID:</span> {caseId}</div>
        <div className="text-sm"><span className="font-semibold">Status:</span> {status ?? "—"}</div>
        <div className="text-sm break-all">
          <span className="font-semibold">Checksum:</span> {checksum ?? "—"}
        </div>
      </CardContent>
    </Card>
  );
}
