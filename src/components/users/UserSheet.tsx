import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Role, User } from "@/apis/types"
import { createUserApi, updateUserApi } from "@/apis/user.api"
import { globalNotify } from "@/lib/notify"
import { Loader2, Check, ChevronsUpDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

// Base schema for fields that are always present
const baseSchema = z.object({
  enabled: z.boolean(),
  roleTextIds: z.array(z.string()).min(1, { message: "You must select at least one role." }),
});

// Schema for creating a new user (includes username and email)
const addUserSchema = baseSchema.extend({
    username: z.string().min(2, { message: "Username must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email." }),
});

// The final schema type
type FormValues = z.infer<typeof addUserSchema>;

interface UserSheetProps {
  initialData: User | null // If null, it's in "add" mode. Otherwise, "edit" mode.
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSuccess: () => void
  roles: Role[]
}

const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(new Date(timestamp));
}

export function UserSheet({ initialData, isOpen, onOpenChange, onSuccess, roles }: UserSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isEditMode = !!initialData;

  const form = useForm<FormValues>({
    // Use the appropriate schema based on the mode
    resolver: zodResolver(isEditMode ? baseSchema : addUserSchema),
    defaultValues: {
      username: "",
      email: "",
      enabled: true,
      roleTextIds: [],
    },
  })

  // Pre-populate the form when in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      const userRoleIds = roles
        .filter(role => initialData.roles.includes(role.name))
        .map(role => role.textId);
        
      form.reset({
        username: initialData.username,
        email: initialData.email,
        enabled: initialData.enabled,
        roleTextIds: userRoleIds,
      })
    } else {
      // Reset to default when in "add" mode or when sheet closes
      form.reset({
        username: "",
        email: "",
        enabled: true,
        roleTextIds: [],
      });
    }
  }, [initialData, isOpen, form, roles, isEditMode]);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      if (isEditMode && initialData) {
        // Update existing user
        const { enabled, roleTextIds } = values;
        await updateUserApi(initialData.textId, { enabled, roleTextIds });
        globalNotify({ title: "Success", description: "User updated successfully." });
      } else {
        // Create new user
        await createUserApi(values);
        globalNotify({ title: "Success", description: "User created successfully." });
      }
      onSuccess() // Trigger refetch on the parent page
      onOpenChange(false) // Close the sheet
    } catch (error) {
      console.error("Failed to save user:", error)
      globalNotify({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save the user.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const selectedRoles = roles.filter(role => form.watch('roleTextIds').includes(role.textId));

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditMode ? "Edit User" : "Add New User"}</SheetTitle>
          <SheetDescription>
            {isEditMode ? "Update the user's details and roles." : "Fill in the details below to create a new user account."}
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {isEditMode ? (
                    <>
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input value={initialData?.username || ''} readOnly disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={initialData?.email || ''} readOnly disabled />
                        </div>
                    </>
                ) : (
                    <>
                        <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Username <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., johndoe" {...field} />
                            </FormControl>
                            <FormDescription>
                                This will be the user's login name.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., john.doe@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                                The user will use this email for notifications.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </>
                )}
                
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <FormLabel>Enable User</FormLabel>
                            <FormDescription>
                                Allow this user to sign in immediately.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleTextIds"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Roles <span className="text-destructive">*</span></FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                    "w-full justify-between h-auto",
                                    !field.value?.length && "text-muted-foreground"
                                    )}
                                >
                                    <div className="flex gap-1 flex-wrap">
                                        {selectedRoles.length > 0
                                            ? selectedRoles.map(role => (
                                                <Badge
                                                    variant="secondary"
                                                    key={role.textId}
                                                    className="mr-1"
                                                >
                                                    {role.name.replace('ROLE_', '')}
                                                </Badge>
                                            ))
                                            : "Select roles..."}
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search roles..." />
                                    <CommandList style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        <CommandEmpty>No roles found.</CommandEmpty>
                                        <CommandGroup>
                                            {roles.map((role) => (
                                            <CommandItem
                                                value={role.name}
                                                key={role.textId}
                                                onSelect={() => {
                                                    const currentRoles = field.value || [];
                                                    const newRoles = currentRoles.includes(role.textId)
                                                        ? currentRoles.filter((id) => id !== role.textId)
                                                        : [...currentRoles, role.textId];
                                                    field.onChange(newRoles);
                                                }}
                                            >
                                                <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    field.value?.includes(role.textId) ? "opacity-100" : "opacity-0"
                                                )}
                                                />
                                                {role.name.replace('ROLE_', '')}
                                            </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                         <FormDescription>
                            Assign one or more roles to this user.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                  )}
                />

                {isEditMode && (
                    <div className="space-y-1 pt-2">
                        <p className="text-xs text-muted-foreground">
                            Created on <span className="font-medium text-foreground">{formatDate(initialData?.createdAt)}</span> by <span className="font-medium text-foreground">{initialData?.createdBy || '-'}</span>
                        </p>
                        {initialData?.updatedAt && (
                        <p className="text-xs text-muted-foreground">
                            Last updated on <span className="font-medium text-foreground">{formatDate(initialData?.updatedAt)}</span> by <span className="font-medium text-foreground">{initialData?.updatedBy || '-'}</span>
                        </p>
                        )}
                    </div>
                )}

                <SheetFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? "Save Changes" : "Create User"}
                    </Button>
                </SheetFooter>
            </form>
            </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
