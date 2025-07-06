import { useState, useEffect } from "react"
import { MoreHorizontal, Pencil, Trash2, ShieldPlus, Shield, Loader2, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getRolesApi, deleteRoleApi, getPrivilegesApi } from "@/apis/role.api"
import type { Role, Privilege } from "@/apis/types"
import { globalNotify } from "@/lib/notify"
import { RoleSheet } from "@/pages/roles/RoleSheet"
import { usePermissions } from "@/contexts/usePermissions" // Import the hook

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [privileges, setPrivileges] = useState<Privilege[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // State for the RoleSheet
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  // State for Delete Confirmation Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  
  const { hasPrivilege } = usePermissions() // Use the permissions hook
  const canWrite = hasPrivilege('ROLE_MANAGEMENT_WRITE');

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const rolesPromise = getRolesApi()
      const privilegesPromise = getPrivilegesApi()

      const [rolesResponse, privilegesResponse] = await Promise.all([rolesPromise, privilegesPromise]);
      
      const rolesData = rolesResponse.data.data
      if (Array.isArray(rolesData)) {
        setRoles(rolesData)
      } else {
        setRoles([])
      }

      const privilegesData = privilegesResponse.data.data
       if (Array.isArray(privilegesData)) {
        setPrivileges(privilegesData)
      } else {
        setPrivileges([])
      }

    } catch (error) {
      console.error("Failed to fetch data:", error)
      globalNotify({
        variant: "destructive",
        title: "Fetch Failed",
        description: "Could not retrieve roles and privileges.",
      })
      setRoles([])
      setPrivileges([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenAdd = () => {
    setSelectedRole(null)
    setIsSheetOpen(true);
  }

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role)
    setIsSheetOpen(true);
  }

  const handleOpenDeleteDialog = (role: Role) => {
    setRoleToDelete(role)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return
    try {
        await deleteRoleApi(roleToDelete.textId);
        globalNotify({ title: "Success", description: "Role deleted successfully." });
        fetchData(); // Refetch data after deletion
    } catch (error: unknown) {
        console.error("Failed to delete role:", error);
        globalNotify({
            variant: "destructive",
            title: "Delete Failed",
            description: error instanceof Error ? error.message : "Could not delete the role.",
        });
    } finally {
        setIsDeleteDialogOpen(false)
        setRoleToDelete(null)
    }
  }
  
  const getPrivilegeDetails = (privilegeName: string) => {
    return privileges.find(p => p.name === privilegeName);
  }

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Roles</CardTitle>
              <CardDescription>
                Manage user roles and their associated permissions.
              </CardDescription>
            </div>
            <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-2">
              <div className="text-sm text-muted-foreground">
                <strong>{roles.length}</strong> roles
              </div>
              {canWrite && (
                <Button className="gap-1" onClick={handleOpenAdd}>
                  <ShieldPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Role</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile View: List of Cards */}
          <div className="md:hidden">
            {isLoading ? (
              <div className="flex items-center justify-center p-16 text-muted-foreground gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading roles...</span>
              </div>
            ) : roles.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 text-center p-16 text-muted-foreground">
                <Shield className="h-16 w-16" />
                <h3 className="text-xl font-semibold">No Roles Found</h3>
                {canWrite && <p>Click "Add Role" to create a new one.</p>}
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {roles.map((role) => (
                  <div
                    key={role.textId}
                    className="bg-background rounded-lg border p-4 flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-base">{role.name.replace("ROLE_", "")}</p>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      {canWrite && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenEdit(role)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => handleOpenDeleteDialog(role)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <div className="border-t pt-4">
                        <div className="flex flex-col gap-2 text-sm">
                            <span className="text-muted-foreground mb-1">Privileges ({role.privileges.length})</span>
                            <div className="flex flex-col gap-2">
                            {role.privileges.length > 0 ? (
                                role.privileges.map((privilegeName) => {
                                const privilege = getPrivilegeDetails(privilegeName);
                                return (
                                    <div key={privilegeName} className="flex flex-col p-2 rounded-md border">
                                        <span className="font-semibold">{privilegeName}</span>
                                        <span className="text-sm text-muted-foreground">{privilege?.description}</span>
                                    </div>
                                )
                                })
                            ) : (
                                <span className="text-muted-foreground text-sm">No privileges assigned</span>
                            )}
                            </div>
                        </div>
                    </div>
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
                  <TableHead className="py-4 px-6 text-foreground">Role</TableHead>
                  <TableHead className="py-4 px-6 text-foreground">Description</TableHead>
                  <TableHead className="py-4 px-6 text-foreground">Privileges</TableHead>
                  <TableHead className="text-right py-4 px-6">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading roles...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                        <Shield className="h-16 w-16" />
                        <h3 className="text-xl font-semibold">No Roles Found</h3>
                        {canWrite && <p>Click "Add Role" to get started.</p>}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.textId} className="hover:bg-muted/50">
                      <TableCell className="px-6 font-medium">
                        {role.name.replace("ROLE_", "")}
                      </TableCell>
                      <TableCell className="px-6 text-muted-foreground max-w-sm truncate">
                        {role.description}
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex flex-col gap-2 max-w-xs">
                            {role.privileges.length > 0 ? (
                                role.privileges.slice(0, 2).map((privilegeName) => {
                                    const privilege = getPrivilegeDetails(privilegeName);
                                    return (
                                        <div key={privilegeName}>
                                            <p className="font-semibold">{privilegeName}</p>
                                            <p className="text-sm text-muted-foreground">{privilege?.description}</p>
                                        </div>
                                    )
                                })
                            ) : (
                                <span className="text-sm text-muted-foreground">None</span>
                            )}
                            {role.privileges.length > 2 && (
                            <TooltipProvider>
                                <Tooltip>
                                <TooltipTrigger>
                                    <Badge variant="secondary" className="mt-2">+{role.privileges.length - 2} more</Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="flex flex-col gap-2 p-2 max-w-xs">
                                    {role.privileges.slice(2).map((privilegeName) => {
                                        const privilege = getPrivilegeDetails(privilegeName);
                                        return (
                                            <div key={privilegeName}>
                                                <p className="font-semibold">{privilegeName}</p>
                                                <p className="text-sm text-primary-foreground/80">{privilege?.description}</p>
                                            </div>
                                        )
                                    })}
                                    </div>
                                </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        {canWrite && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleOpenEdit(role)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => handleOpenDeleteDialog(role)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <RoleSheet
        initialData={selectedRole}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSuccess={fetchData}
        privileges={privileges}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role:{" "}
              <span className="font-semibold">{roleToDelete?.name.replace("ROLE_", "")}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className={buttonVariants({ variant: "destructive" })}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
          <button
            onClick={() => setIsDeleteDialogOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}