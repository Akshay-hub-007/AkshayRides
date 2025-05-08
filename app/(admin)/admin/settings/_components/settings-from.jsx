"use client"
import { getDealerInfo, getUsers, saveWorkingHours, updateUserRole } from '@/actions/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@radix-ui/react-dropdown-menu';
import { Badge, Clock, Loader2, Save, Search, Shield, Users, UserX } from 'lucide-react'
import useFetch from '@/hooks/use-fetch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const SettingsForm = () => {


    const [userSearch, setUserSearch] = useState("")
    const DAYS = [
        { value: "MONDAY", label: "Monday" },
        { value: "TUESDAY", label: "Tuesday" },
        { value: "WEDNESDAY", label: "Wednesday" },
        { value: "THURSDAY", label: "Thursday" },
        { value: "FRIDAY", label: "Friday" },
        { value: "SATURDAY", label: "Saturday" },
        { value: "SUNDAY", label: "Sunday" },
    ];
    const [workingHours, setWorkingHours] = useState(
        DAYS.map((day) => ({
            daysOfWeek: day.value,
            openTime: "9:00",
            closeTime: "18:00",
            isOpen: day.value != "SUNDAY"
        }))
    )
    const {
        loading: fetchingSettings,
        fn: fetchDealershipInfo,
        data: settingsData,
        error: settingsError,
    } = useFetch(getDealerInfo);

    useEffect(() => {
        if (settingsData?.success && settingsData.data) {
            const dealership = settingsData.data
            if (dealership.workingHours.length > 0) {
                const mappedHours = DAYS.map((day) => {
                    const hourData = dealership.workingHours.find((h => h.dayOfWeek === day.value))
                    if (hourData) {
                        return {
                            dayOFWeek: hourData.dayOfWeek,
                            openTime: hourData.openTime,
                            closeTime: hourData.closeTime,
                            isOpen: hourData.isOpen
                        }
                    }

                    return {
                        dayOfWeek: day.value,
                        openTime: "09:00",
                        closeTime: "18:00",
                        isOpen: day.value !== "SUNDAY"
                    }
                })
                setWorkingHours(mappedHours)
            }
        }
    }, [settingsData])
    const {
        loading: savingHours,
        fn: saveHours,
        data: saveResult,
        error: saveError,
    } = useFetch(saveWorkingHours);

    const {
        loading: fetchingUsers,
        fn: fetchUsers,
        data: usersData,
        error: usersError,
    } = useFetch(getUsers);

    const {
        loading: updatingRole,
        fn: updateRole,
        data: updateRoleResult,
        error: updateRoleError,
    } = useFetch(updateUserRole);

    useEffect(() => {
        if (settingsError) {
            toast.error("Failed to load dealership settings");
        }

        if (saveError) {
            toast.error(`Failed to save working hours: ${saveError.message}`);
        }

        if (usersError) {
            toast.error("Failed to load users");
        }

        if (updateRoleError) {
            toast.error(`Failed to update user role: ${updateRoleError.message}`);
        }
    }, [settingsError, saveError, usersError, updateRoleError]);

    useEffect(() => {
        fetchDealershipInfo();
        fetchUsers()
    }, [])

    const handleWorkingHourChange = (index, field, value) => {
        const updatedHours = [...workingHours]
        updatedHours[index] = {
            ...updatedHours[index],
            [field]: value,
        };
        setWorkingHours(updatedHours)
    }
    useEffect(() => {
        if (saveResult?.success) {
            toast.success("Working hours saved Successfully");
            fetchDealershipInfo();
        }

        if (updateRoleResult?.success) {
            toast.success("User role updated successfully");
            fetchUsers();
            setConfirmAdminDialog(false);
            setConfirmRemoveDialog(false);
        }
    }, [saveResult, updateRoleResult])
    useEffect(() => {
        if (saveError) {
            toast.error("Error in saving the hours ")
        }
    }, [saveError])
    const handleSaveWorkingHours = async () => {
        await saveHours(workingHours)
    }
    const handleMakeAdmin = async (user) => {
        if (confirm(`Are you sure you want to  give admin privilegs to ${user.name || user.email}? Admin users can manage all aspects od the dealership`)) {
            await updateRole(user.id, "ADMIN")
        }
    }
    const handleRemoveAdmin = async (user) => {
        if (confirm(`Are you sure you want to remove   admin privilegs to ${user.name || user.email}?There is no longer be able  to access the admin dashboard`)) {
            await updateRole(user.id, "USER")
        }
    }
    const filteredUsers = usersData?.success
        ? usersData.data.filter(
            (user) =>
                user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                user.email.toLowerCase().includes(userSearch.toLowerCase())
        )
        : [];
    return (
        <div className='space-y-6'>
            <Tabs defaultValue="hours">
                <TabsList>
                    <TabsTrigger value="hours">
                        <Clock className='h-4 w4 mr-2' />
                        Working Hours
                    </TabsTrigger>
                    <TabsTrigger value="admins">
                        <Shield className='h-4 w-4 mr-2' />
                        Admin Users
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="hours" className="space-y-6 mt-6">
                    <Card className={"w-full"}>
                        <CardHeader>
                            <CardTitle>Working Hours</CardTitle>
                            <CardDescription>
                                Set your dealership's working hours for each day of the week
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                {
                                    DAYS.map((day, index) => {
                                        return (
                                            <div
                                                key={index}
                                                className='grid grid-cols-12 gap-5  items-center  py-3 px-4 rounded-lg hover:bg-slate-50'
                                            >
                                                <div className='col-span-3 md:col-span-2'>
                                                    <div className='font-medium'>
                                                        {day.label}
                                                    </div>
                                                </div>
                                                <div className='col-span-9 md:col-span-2 flex items-center '>
                                                    <Checkbox
                                                        id={`is-open-${day.value}`}
                                                        checked={workingHours[index]?.isOpen}
                                                        onCheckedChange={(checked) => {
                                                            handleWorkingHourChange(index, "isOpen", checked);
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor={`is-open-${day.value}`}
                                                        className='ml-2 cursor-pointer'
                                                    >
                                                        {workingHours[index]?.isOpen ? "Open" : "Closed"}
                                                    </Label>
                                                </div>

                                                {workingHours[index]?.isOpen && (
                                                    <>
                                                        <div className="col-span-5 md:col-span-4">
                                                            <div className="flex items-center">
                                                                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                                                <Input
                                                                    type="time"
                                                                    value={workingHours[index]?.openTime}
                                                                    onChange={(e) =>
                                                                        handleWorkingHourChange(
                                                                            index,
                                                                            "openTime",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="text-sm"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="text-center col-span-1">to</div>

                                                        <div className="col-span-5 md:col-span-3">
                                                            <Input
                                                                type="time"
                                                                value={workingHours[index]?.closeTime}
                                                                onChange={(e) =>
                                                                    handleWorkingHourChange(
                                                                        index,
                                                                        "closeTime",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="text-sm"
                                                            />
                                                        </div>

                                                    </>
                                                )}
                                                {
                                                    !workingHours[index]?.isOpen && (
                                                        <div className='col-span-11 md:col-span-8 text-gray-500 italic text-sm'>
                                                            Closed all day

                                                        </div>
                                                    )
                                                }
                                            </div>
                                        )
                                    })
                                }
                            </div>

                            <div className='mt-6 flex justify-end' disabled={savingHours}>
                                <Button onClick={handleSaveWorkingHours}>
                                    {savingHours ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Working Hours
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>

                    </Card>

                </TabsContent>
                <TabsContent value="admins" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Users</CardTitle>
                            <CardDescription>
                                Manage users with admin privileges
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='mb-6 relative'>
                                <Search
                                    className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    type="search"
                                    placeholder="Search Users"
                                    className="pl-9  w-full"
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                />
                            </div>
                            {fetchingUsers ? (
                                <div className="py-12 flex justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                </div>
                            ) : usersData?.success && filteredUsers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUsers.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                                {user.imageUrl ? (
                                                                    <img
                                                                        src={user.imageUrl}
                                                                        alt={user.name || "User"}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <Users className="h-4 w-4 text-gray-500" />
                                                                )}
                                                            </div>
                                                            <span>{user.name || "Unnamed User"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                user.role === "ADMIN"
                                                                    ? "bg-green-800"
                                                                    : "bg-gray-800"
                                                            }
                                                        >
                                                            {user.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {user.role === "ADMIN" ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600"
                                                                onClick={() => {
                                                                    setUserToDemote(user);
                                                                    setConfirmRemoveDialog(true);
                                                                }}
                                                                disabled={updatingRole}
                                                            >
                                                                <UserX className="h-4 w-4 mr-2" />
                                                                Remove Admin
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setUserToPromote(user);
                                                                    setConfirmAdminDialog(true);
                                                                }}
                                                                disabled={updatingRole}
                                                            >
                                                                <Shield className="h-4 w-4 mr-2" />
                                                                Make Admin
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                                        No users found
                                    </h3>
                                    <p className="text-gray-500">
                                        {userSearch
                                            ? "No users match your search criteria"
                                            : "There are no users registered yet"}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

        </div>
    )
}

export default SettingsForm