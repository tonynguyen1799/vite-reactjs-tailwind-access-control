import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck } from "lucide-react";
import { fetchAllPrivileges } from "@/apis/privilege.api";
import type { Privilege } from "@/apis/types";

export default function PrivilegesPage() {
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchAllPrivileges()
      .then(setPrivileges)
      .catch(() => setPrivileges([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Privileges</CardTitle>
            <CardDescription>List of all system privileges.</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>{privileges.length}</strong> privileges
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile View: List of Cards */}
        <div className="md:hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-16 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading privileges...</span>
            </div>
          ) : privileges.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 text-center p-16 text-muted-foreground">
              <ShieldCheck className="h-16 w-16" />
              <h3 className="text-xl font-semibold">No Privileges Found</h3>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {privileges.map((priv) => (
                <div key={priv.name} className="bg-background rounded-lg border p-4 flex flex-col gap-2">
                  <span className="font-semibold">{priv.name}</span>
                  <span className="text-sm text-muted-foreground">{priv.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Desktop View: Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <TableHead className="py-4 px-6 text-foreground">Privilege</TableHead>
                <TableHead className="py-4 px-6 text-foreground">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center h-24">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Loading privileges...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : privileges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                      <ShieldCheck className="h-16 w-16" />
                      <h3 className="text-xl font-semibold">No Privileges Found</h3>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                privileges.map((priv) => (
                  <TableRow key={priv.name} className="hover:bg-muted/50">
                    <TableCell className="px-6 font-medium">{priv.name}</TableCell>
                    <TableCell className="px-6 text-muted-foreground max-w-sm truncate">{priv.description}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 