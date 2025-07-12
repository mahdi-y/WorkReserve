/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useToast } from '../../hooks/use-toast';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext'; 
import type { User_Service } from '../../services/userService'; 
import { 
  Users, 
  Search, 
  Edit3, 
  Trash2, 
  UserCheck, 
  UserX,
  Shield,
  ChevronDown,
  User,
  Crown, 
} from 'lucide-react';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  }
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User_Service[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User_Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User_Service | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<User_Service>>({});
  const { toast } = useToast();
  const { user: currentUser } = useAuth(); 

  const isCurrentUser = (user: User_Service): boolean => {
    return !!(currentUser && currentUser.email === user.email);
  };

  const isOtherAdmin = (user: User_Service): boolean => {
    return user.role === 'ADMIN' && !isCurrentUser(user);
  };

  const isActionDisabled = (user: User_Service): boolean => {
    return isCurrentUser(user) || isOtherAdmin(user);
  };

  useEffect(() => {
    userService.getAllUsers()
      .then(setUsers)
      .catch(() => toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" }));
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(user => user.enabled);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(user => !user.enabled);
      } else if (statusFilter === 'unverified') {
        filtered = filtered.filter(user => !user.emailVerified);
      }
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleUpdateUserRole = async (userId: number, newRole: 'USER' | 'ADMIN') => {
    const targetUser = users.find(u => u.id === userId);
    
    if (targetUser && isCurrentUser(targetUser)) {
      toast({ 
        title: "Action Restricted", 
        description: "You cannot change your own role.", 
        variant: "destructive" 
      });
      return;
    }

    if (targetUser && isOtherAdmin(targetUser)) {
      toast({ 
        title: "Action Restricted", 
        description: "You cannot change another admin's role.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      const updated = await userService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      toast({ title: "User Role Updated", description: `${updated.fullName}'s role has been updated to ${newRole}.` });
    } catch {
      toast({ title: "Error", description: "Failed to update user role", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const targetUser = users.find(u => u.id === userId);
    
    if (targetUser && isCurrentUser(targetUser)) {
      toast({ 
        title: "Action Restricted", 
        description: "You cannot delete your own account.", 
        variant: "destructive" 
      });
      return;
    }

    if (targetUser && isOtherAdmin(targetUser)) {
      toast({ 
        title: "Action Restricted", 
        description: "You cannot delete another admin's account.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      await userService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({ title: "User Deleted", description: `User has been removed from the system.`, variant: "destructive" });
    } catch {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    }
  };

  const handleEditUser = (user: User_Service) => {
    if (isCurrentUser(user)) {
      toast({ 
        title: "Action Restricted", 
        description: "You cannot edit your own account from here. Use your profile settings instead.", 
        variant: "destructive" 
      });
      return;
    }

    if (isOtherAdmin(user)) {
      toast({ 
        title: "Action Restricted", 
        description: "You cannot edit another admin's account.", 
        variant: "destructive" 
      });
      return;
    }

    setSelectedUser(user);
    setEditFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      enabled: user.enabled
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser || !editFormData.fullName || !editFormData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatePayload: Partial<User_Service> = {
        fullName: editFormData.fullName,
        email: editFormData.email,
        role: editFormData.role,
        enabled: editFormData.enabled,
      };

      const updatedUser = await userService.updateUser(selectedUser.id, updatePayload);

      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id ? { ...user, ...updatedUser } : user
        )
      );
      
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setEditFormData({});
      
      toast({
        title: "User Updated",
        description: `${updatedUser.fullName}'s information has been updated successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "An error occurred while updating the user.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    setEditFormData({});
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'ADMIN' ? 'default' : 'secondary';
  };

  const getStatusBadgeVariant = (enabled: boolean) => {
    return enabled ? 'default' : 'destructive';
  };

  const handleToggleBan = async (userId: number, banned: boolean) => {
    const targetUser = users.find(u => u.id === userId);
    
    if (targetUser && isCurrentUser(targetUser)) {
      toast({ 
        title: "Action Restricted", 
        description: "You cannot ban your own account.", 
        variant: "destructive" 
      });
      return;
    }

    if (targetUser && isOtherAdmin(targetUser)) {
      toast({ 
        title: "Action Restricted", 
        description: "You cannot ban another admin's account.", 
        variant: "destructive" 
      });
      return;
    }

    console.log("Before ban/unban:", { userId, banned });
    
    try {
      const updated = banned
        ? await userService.unbanUser(userId)
        : await userService.banUser(userId);
      
      console.log("API response:", updated); 
      
      setUsers(prev => {
        const newUsers = prev.map(u => u.id === userId ? { ...u, banned: updated.banned } : u);
        console.log("Updated users state:", newUsers.find(u => u.id === userId));
        return newUsers;
      });
      
      toast({
        title: banned ? "User Unbanned" : "User Banned",
        description: `${updated.fullName} has been ${banned ? "unbanned" : "banned"}.`
      });
    } catch (error: any) {
      console.error("Ban/unban error:", error);
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to update user ban status", 
        variant: "destructive" 
      });
    }
  };

  const getDisabledTooltip = (user: User_Service, action: string) => {
    if (isCurrentUser(user)) {
      return `Cannot ${action} your own account`;
    }
    if (isOtherAdmin(user)) {
      return `Cannot ${action} another admin's account`;
    }
    return `${action} user`;
  };

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
            </div>

          </div>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-blue-600">Total Users</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{users.filter(u => u.enabled).length}</div>
              <div className="text-sm text-green-600">Active Users</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'ADMIN').length}</div>
              <div className="text-sm text-purple-600">Administrators</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{users.filter(u => !u.emailVerified).length}</div>
              <div className="text-sm text-orange-600">Unverified</div>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className={
                      isCurrentUser(user) 
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" 
                        : isOtherAdmin(user)
                        ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                        : ""
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {user.fullName}
                            {isCurrentUser(user) && (
                              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                                <Crown className="w-3 h-3 mr-1" />
                                You
                              </Badge>
                            )}
                            {isOtherAdmin(user) && (
                              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-300">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="flex items-center gap-1 w-fit h-auto p-1 rounded-full text-left"
                            disabled={isActionDisabled(user)}
                          >
                            <Badge variant={getRoleBadgeVariant(user.role)} className="pointer-events-none flex items-center gap-1">
                              {user.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                              {user.role}
                            </Badge>
                            {!isActionDisabled(user) && <ChevronDown className="w-4 h-4 text-gray-500" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem 
                            disabled={user.role === 'USER'} 
                            onSelect={() => handleUpdateUserRole(user.id, 'USER')}
                          >
                            <User className="w-4 h-4 mr-2" /> User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            disabled={user.role === 'ADMIN'} 
                            onSelect={() => handleUpdateUserRole(user.id, 'ADMIN')}
                          >
                            <Shield className="w-4 h-4 mr-2" /> Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.banned ? 'destructive' : getStatusBadgeVariant(user.enabled)}>
                        {user.banned ? 'Banned' : user.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
                        {user.emailVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          disabled={isActionDisabled(user)}
                          title={getDisabledTooltip(user, "edit")}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>

                        <Button
                          variant={user.banned ? "default" : "destructive"}
                          size="sm"
                          title={getDisabledTooltip(user, user.banned ? "unban" : "ban")}
                          onClick={() => handleToggleBan(user.id, user.banned)}
                          disabled={isActionDisabled(user)}
                          className={user.banned ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                        >
                          {user.banned ? (
                            <>
                              <UserCheck className="w-4 h-4" />
                              <span className="ml-1 hidden sm:inline">Unban</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-4 h-4" />
                              <span className="ml-1 hidden sm:inline">Ban</span>
                            </>
                          )}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={isActionDisabled(user)}
                              title={getDisabledTooltip(user, "delete")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.fullName}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No users found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-fullName">Full Name *</Label>
              <Input
                id="edit-fullName"
                value={editFormData.fullName || ''}
                onChange={(e) => setEditFormData((prev: any) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData((prev: any) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
                <Select 
                value={editFormData.role || 'USER'} 
                onValueChange={(value) => setEditFormData((prev: any) => ({ ...prev, role: value as 'USER' | 'ADMIN' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-enabled"
                checked={editFormData.enabled || false}
                onChange={(e) => setEditFormData((prev: any) => ({ ...prev, enabled: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit-enabled">Account Enabled</Label>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default UserManagement;