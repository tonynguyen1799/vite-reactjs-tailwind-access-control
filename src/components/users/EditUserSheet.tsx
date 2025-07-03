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
import { updateUserApi } from "@/apis/user.api"
import { globalNotify } from "@/lib/notify"
import { Loader2, Check, ChevronsUpDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label" // This import was missing

// Validation schema for the edit form
const formSchema = z.object({
  enabled: z.boolean(),
  roleTextIds: z.array(z.string()).min(1, { message: "You must select at least one role." }),
})

interface EditUserSheetProps {
  userToEdit: User | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onUserUpdated: () => void
  roles: Role[]
}

export function EditUserSheet({ userToEdit, isOpen, onOpenChange, onUserUpdated, roles }: EditUserSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enabled: true,
      roleTextIds: [],
    },
  })

  // Pre-populate the form when a user is selected for editing
  useEffect(() => {
    if (userToEdit) {
      const userRoleIds = roles
        .filter(role => userToEdit.roles.includes(role.name))
        .map(role => role.textId);
        
      form.reset({
        enabled: userToEdit.enabled,
        roleTextIds: userRoleIds,
      })
    }
  }, [userToEdit, form, roles])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userToEdit) return;

    setIsSubmitting(true)
    try {
      await updateUserApi(userToEdit.textId, values)
      globalNotify({
        title: "Success",
        description: "User updated successfully.",
      })
      onUserUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update user:", error)
      globalNotify({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the user.",
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
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>
            Update the user's details and roles.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label>Username</Label>
                    <Input value={userToEdit?.username || ''} readOnly disabled />
                </div>
                 <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={userToEdit?.email || ''} readOnly disabled />
                </div>

                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <FormLabel>Enable User</FormLabel>
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
                        <FormLabel>Roles</FormLabel>
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
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </SheetFooter>
            </form>
            </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
