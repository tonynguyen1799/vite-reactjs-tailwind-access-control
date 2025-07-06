import { useState, useEffect, useRef } from "react"
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

interface UserSheetProps {
  initialData: User | null
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
  const isEditMode = !!initialData;
  
  const formSchema = z.object({
    username: z.string().optional(),
    email: z.string().optional(),
    enabled: z.boolean(),
    roleTextIds: z.array(z.string()).min(1, { message: "You must select at least one role." }),
  }).refine(data => {
    // If not in edit mode, username and email are required
    if (!isEditMode) {
      return !!data.username && data.username.length >= 2;
    }
    return true;
  }, {
    message: "Username must be at least 2 characters.",
    path: ["username"],
  }).refine(data => {
    if (!isEditMode) {
      return !!data.email && z.string().email().safeParse(data.email).success;
    }
    return true;
  }, {
    message: "Please enter a valid email.",
    path: ["email"],
  });
  
  type FormValues = z.infer<typeof formSchema>;
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const usernameInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema), // Use the unified schema
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

  // Focus username input on open in "add" mode
  useEffect(() => {
    if (isOpen && !isEditMode) {
      setTimeout(() => {
        usernameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isEditMode]);

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
        // We can assert non-null here because the schema refinement guarantees they exist
        await createUserApi({ 
          username: values.username!, 
          email: values.email!, 
          roleTextIds: values.roleTextIds 
        });
        globalNotify({ title: "Success", description: "User created successfully." });
      }
      onSuccess() 
      onOpenChange(false) 
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
        <div>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                <Input 
                                    placeholder="e.g., johndoe" 
                                    {...field}
                                    value={field.value ?? ''} // handle optional value
                                    ref={usernameInputRef}
                                />
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
                                <Input 
                                  placeholder="e.g., john.doe@example.com" 
                                  {...field}
                                  value={field.value ?? ''} // handle optional value
                                />
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