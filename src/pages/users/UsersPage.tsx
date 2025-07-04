import { useState, useEffect } from "react"
import { MoreHorizontal, Pencil, Trash2, UserPlus, Search, CheckCircle2, XCircle, ListFilter, X, Users, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { getUsersApi, deleteUserApi } from "@/apis/user.api"
import { getRolesApi } from "@/apis/role.api"
import type { User, Role } from "@/apis/types"
import { globalNotify } from "@/lib/notify"
import { UserSheet } from "@/pages/users/UserSheet"
import { usePermissions } from "@/contexts/usePermissions" // Import the hook

// A custom hook for debouncing a value
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// A small, reusable component for displaying status with icons
const StatusIndicator = ({ isActive }: { isActive: boolean }) => (
  <div className="flex items-center gap-2">
    {isActive ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-gray-400" />
    )}
    <span className="text-sm text-muted-foreground">
      {isActive ? "Active" : "Inactive"}
    </span>
  </div>
)

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // State for the UserSheet
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // State for Delete Confirmation Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  // Main filter states that trigger API calls
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  // Temporary states for the dropdown form
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [tempSearchTerm, setTempSearchTerm] = useState("")
  const [tempStatusFilter, setTempStatusFilter] = useState("all")
  const [tempRoleFilter, setTempRoleFilter] = useState("all")

  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  
  const { hasPrivilege } = usePermissions() // Use the permissions hook
  const canWrite = hasPrivilege('USER_MANAGEMENT_WRITE');

  // Sync temp filters when dropdown opens
  useEffect(() => {
    if (isFilterOpen) {
      setTempSearchTerm(searchTerm)
      setTempStatusFilter(statusFilter)
      setTempRoleFilter(roleFilter)
    }
  }, [isFilterOpen, searchTerm, statusFilter, roleFilter])

  const fetchUsersAndRoles = async () => {
    setIsLoading(true)
    try {
      const rolesResponse = await getRolesApi()
      const rolesData = rolesResponse.data.data
      if (rolesData && Array.isArray(rolesData)) {
        setRoles(rolesData)
      }

      const filters: { enabled?: boolean; roleTextIds?: string; search?: string } = {}
      if (statusFilter !== "all") filters.enabled = statusFilter === "true"
      if (roleFilter !== "all") filters.roleTextIds = roleFilter
      if (debouncedSearchTerm) filters.search = debouncedSearchTerm

      const usersResponse = await getUsersApi({
        page: page - 1,
        size,
        ...filters,
      })

      const responseData = usersResponse.data.data
      if (responseData && Array.isArray(responseData.content)) {
        setUsers(responseData.content)
        setTotalPages(responseData.totalPages)
        setTotalElements(responseData.totalElements)
      } else {
        setUsers([])
        setTotalPages(0)
        setTotalElements(0)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      globalNotify({
        variant: "destructive",
        title: "Fetch Failed",
        description: "Could not retrieve initial page data.",
      })
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsersAndRoles()
  }, [page, size, debouncedSearchTerm, statusFilter, roleFilter])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchTerm, statusFilter, roleFilter])

  const handleOpenAdd = () => {
    setSelectedUser(null)
    setIsSheetOpen(true)
  }

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user)
    setIsSheetOpen(true)
  }

  const handleOpenDeleteDialog = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    try {
      await deleteUserApi(userToDelete.textId)
      globalNotify({
        title: "Success",
        description: "User deleted successfully.",
      })
      fetchUsersAndRoles() // Refetch users after deletion
    } catch (error) {
      console.error("Failed to delete user:", error)
      globalNotify({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete the user.",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const handlePageSizeChange = (newSize: string) => {
    setSize(parseInt(newSize, 10))
    setPage(1)
  }

  const handleApplyFilters = () => {
    setSearchTerm(tempSearchTerm)
    setStatusFilter(tempStatusFilter)
    setRoleFilter(tempRoleFilter)
    setIsFilterOpen(false) // Close the dropdown
  }

  const isFiltered = statusFilter !== "all" || roleFilter !== "all" || searchTerm !== ""

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage your users and their permissions.</CardDescription>
            </div>
            <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-2">
              <div className="text-sm text-muted-foreground">
                <strong>{totalElements}</strong> users
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-1" disabled={isLoading}>
                      <ListFilter className="h-4 w-4" />
                      <span>Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[250px]">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <Label htmlFor="search-filter" className="text-xs font-semibold">
                        Username or Email
                      </Label>
                      <div className="relative mt-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="search-filter"
                          placeholder="Search..."
                          className="pl-8"
                          value={tempSearchTerm}
                          onChange={(e) => setTempSearchTerm(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="p-2">
                      <Label htmlFor="status-filter" className="text-xs font-semibold">
                        Status
                      </Label>
                      <Select
                        value={tempStatusFilter}
                        onValueChange={setTempStatusFilter}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="status-filter" className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="true">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span>Active</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="false">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-gray-400" />
                              <span>Inactive</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-2">
                      <Label htmlFor="role-filter" className="text-xs font-semibold">
                        Role
                      </Label>
                      <Select
                        value={tempRoleFilter}
                        onValueChange={setTempRoleFilter}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="role-filter" className="mt-1">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {roles.map((role) => (
                            <SelectItem key={role.textId} value={role.textId}>
                              {role.name.replace("ROLE_", "")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <Button
                        className="w-full"
                        onClick={handleApplyFilters}
                        disabled={isLoading}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                {canWrite && (
                  <Button className="gap-1" disabled={isLoading} onClick={handleOpenAdd}>
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add User</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isFiltered && (
            <div className="px-4 sm:px-6 py-4 border-b flex items-center gap-2 text-sm flex-wrap">
              <span className="text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1.5 pl-2 pr-1">
                  <span className="truncate max-w-[100px]">{searchTerm}</span>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="rounded-full p-0.5 hover:bg-background/20"
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="gap-1.5 pl-2 pr-1">
                  {statusFilter === "true" ? "Active" : "Inactive"}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="rounded-full p-0.5 hover:bg-background/20"
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {roleFilter !== "all" && (
                <Badge variant="secondary" className="gap-1.5 pl-2 pr-1">
                  {roles.find((r) => r.textId === roleFilter)?.name.replace("ROLE_", "") ||
                    roleFilter}
                  <button
                    onClick={() => setRoleFilter("all")}
                    className="rounded-full p-0.5 hover:bg-background/20"
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-auto px-2 py-1 text-xs"
                onClick={() => {
                  setStatusFilter("all")
                  setRoleFilter("all")
                  setSearchTerm("")
                }}
                disabled={isLoading}
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Mobile View: List of Cards */}
          <div className="md:hidden">
            {isLoading ? (
              <div className="text-center p-8 text-muted-foreground">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">No users found.</div>
            ) : (
              <div className="space-y-4 p-4">
                {users.map((user) => (
                  <div
                    key={user.textId}
                    className="bg-background rounded-lg border p-4 flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={user.avatar} alt="Avatar" />
                          <AvatarFallback>
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="truncate">
                          <p className="font-semibold truncate">{user.username}</p>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
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
                            <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => handleOpenDeleteDialog(user)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <StatusIndicator isActive={user.enabled} />
                      </div>
                      <div className="flex flex-col gap-2 text-sm">
                        <span className="text-muted-foreground mb-1">Roles</span>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <Badge key={role} variant="outline" className="border-slate-300 dark:border-slate-700 px-2.5 py-1">
                                {role.replace("ROLE_", "")}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">No roles assigned</span>
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
                  <TableHead className="py-4 px-6 text-foreground">User</TableHead>
                  <TableHead className="py-4 px-6 text-foreground">Status</TableHead>
                  <TableHead className="py-4 px-6 text-foreground">Roles</TableHead>
                  <TableHead className="text-right py-4 px-6">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.textId} className="hover:bg-muted/50">
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar} alt="Avatar" />
                            <AvatarFallback>
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid gap-0.5">
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6">
                        <StatusIndicator isActive={user.enabled} />
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-1 flex-wrap">
                          {user.roles.map((role) => (
                            <Badge key={role} variant="outline" className="px-4 py-1">
                              {role.replace("ROLE_", "")}
                            </Badge>
                          ))}
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
                              <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => handleOpenDeleteDialog(user)}
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
        <CardFooter className="flex flex-col sm:flex-row items-center gap-4 border-t pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <Select
              value={`${size}`}
              onValueChange={handlePageSizeChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder={size} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:ml-auto flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <Pagination className="mx-0 w-fit">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(page - 1)
                    }}
                    className={cn(
                      (page === 1 || isLoading) && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(page + 1)
                    }}
                    className={cn(
                      (page === totalPages || isLoading) && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardFooter>
      </Card>
      <UserSheet
        initialData={selectedUser}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSuccess={fetchUsersAndRoles}
        roles={roles}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account for{" "}
              <span className="font-semibold">{userToDelete?.username}</span>.
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