import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, UserCheck, UserX, Trash2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { usersApi } from "@/api/users.api";
import { format } from "date-fns";
import { useState } from "react";

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [deleteDialog, setDeleteDialog] = useState(false);

    const { data: user, isLoading } = useQuery({
        queryKey: ["admin-user", id],
        queryFn: () => usersApi.getById(id),
        select: (res) => res.data.data,
    });

    const toggleMutation = useMutation({
        mutationFn: () => usersApi.toggleStatus(id),
        onSuccess: (res) => {
            toast.success(
                `User ${res.data.data.isActive ? "activated" : "deactivated"}`
            );
            qc.invalidateQueries({ queryKey: ["admin-user", id] });
            qc.invalidateQueries({ queryKey: ["admin-users"] });
        },
        onError: (err) =>
            toast.error(err.response?.data?.message || "Failed"),
    });

    const deleteMutation = useMutation({
        mutationFn: () => usersApi.delete(id),
        onSuccess: () => {
            toast.success("User deleted");
            navigate("/users");
        },
        onError: (err) =>
            toast.error(err.response?.data?.message || "Failed"),
    });

    if (isLoading)
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <Skeleton className="h-64 xl:col-span-1" />
                    <Skeleton className="h-64 xl:col-span-2" />
                </div>
            </div>
        );

    if (!user)
        return (
            <div className="text-center py-16 text-muted-foreground">
                User not found
            </div>
        );

    return (
        <div className="space-y-6">
            <PageHeader
                title={user.name}
                description={user.email}
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Users", href: "/users" },
                    { label: user.name },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => navigate("/users")}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => toggleMutation.mutate()}
                            disabled={toggleMutation.isPending}
                        >
                            {user.isActive ? (
                                <>
                                    <UserX className="h-4 w-4 mr-2" />
                                    Deactivate
                                </>
                            ) : (
                                <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Activate
                                </>
                            )}
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={() => setDeleteDialog(true)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Profile */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-xl font-bold">
                                    {user.name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <p className="font-semibold text-lg">{user.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap justify-center">
                                <StatusBadge
                                    status={user.isActive ? "active" : "inactive"}
                                />
                                <StatusBadge
                                    status={user.isEmailVerified ? "verified" : "pending"}
                                />
                                <Badge
                                    variant="outline"
                                    className="text-xs capitalize bg-gray-100 text-gray-700 border-0 dark:bg-gray-800"
                                >
                                    {user.authProvider}
                                </Badge>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Joined</span>
                                <span className="font-medium">
                                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                                </span>
                            </div>

                            {user.lastLogin && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Last login
                                    </span>
                                    <span className="font-medium">
                                        {format(
                                            new Date(user.lastLogin),
                                            "MMM d, yyyy"
                                        )}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Saved tools
                                </span>
                                <span className="font-medium">
                                    {user.savedTools?.length || 0}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Liked blogs
                                </span>
                                <span className="font-medium">
                                    {user.likedBlogs?.length || 0}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Section */}
                <div className="xl:col-span-2 space-y-4">
                    {user.savedTools?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Bot className="h-4 w-4" />
                                    Saved AI Tools
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="grid sm:grid-cols-2 gap-3">
                                {user.savedTools.map((tool) => (
                                    <div
                                        key={tool._id}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                                    >
                                        {tool.logo ? (
                                            <img
                                                src={tool.logo}
                                                alt=""
                                                className="h-8 w-8 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 flex items-center justify-center bg-muted rounded">
                                                <Bot className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {tool.name}
                                            </p>
                                            <StatusBadge status={tool.pricing} />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {user.bio && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Bio</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {user.bio}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {(user.website || user.social) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Links</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-2 text-sm">
                                {user.website && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Website
                                        </span>

                                        <a
                                            href={user.website || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline truncate max-w-50"
                                        >
                                            {user.website}
                                        </a>
                                    </div>
                                )}

                                {Object.entries(user.social || {}).map(
                                    ([key, val]) =>
                                        val && (
                                            <div
                                                key={key}
                                                className="flex justify-between"
                                            >
                                                <span className="text-muted-foreground capitalize">
                                                    {key}
                                                </span>

                                                <a
                                                    href={val || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline truncate max-w-50"
                                                >
                                                    {val}
                                                </a>
                                            </div>
                                        )
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={deleteDialog}
                onOpenChange={setDeleteDialog}
                title="Delete user?"
                description={`This will permanently delete ${user.name}'s account and all their data.`}
                confirmLabel="Delete permanently"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate()}
            />
        </div>
    );
};

export default UserDetail;