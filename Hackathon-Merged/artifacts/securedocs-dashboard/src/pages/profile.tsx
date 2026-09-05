import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { User, Shield, Key, Clock, MonitorSmartphone, MapPin, Activity } from 'lucide-react';

export default function Profile() {
  const { toast } = useToast();
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditProfileOpen(false);
    toast({
      title: "Profile updated successfully.",
      description: "Your profile information has been saved.",
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-900",
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangePasswordOpen(false);
    toast({
      title: "Password updated successfully.",
      description: "Your account password has been changed.",
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-900",
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">MY PROFILE</h1>
        <p className="text-slate-500 mt-1">Manage your account information and view recent account activity.</p>
        <div className="text-sm text-slate-400 mt-2">Dashboard / My Profile</div>
      </div>

      {/* PROFILE HEADER */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-white shadow-sm">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Admin" />
              <AvatarFallback className="bg-blue-600 text-white text-xl">AD</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Admin</h2>
              <p className="text-slate-500 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" /> Security Administrator
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-slate-300">Edit Profile</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveProfile}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input id="name" defaultValue="Admin User" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input id="email" type="email" defaultValue="admin@securedocs.demo" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="department" className="text-right">Department</Label>
                      <Input id="department" defaultValue="Administration" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">Role</Label>
                      <Input id="role" defaultValue="Administrator" className="col-span-3" disabled />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditProfileOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">Change Password</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and a new secure password.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdatePassword}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="current" className="text-right">Current</Label>
                      <Input id="current" type="password" required className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="new" className="text-right">New</Label>
                      <Input id="new" type="password" required className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="confirm" className="text-right">Confirm</Label>
                      <Input id="confirm" type="password" required className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsChangePasswordOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Update Password</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white border-t border-slate-100">
          <div>
            <p className="text-sm font-medium text-slate-500">Status</p>
            <p className="font-semibold text-slate-900 flex items-center gap-1 mt-1">
              <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span> Active
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Employee ID</p>
            <p className="font-semibold text-slate-900 mt-1">EMP-001</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Department</p>
            <p className="font-semibold text-slate-900 mt-1">Administration</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Role</p>
            <p className="font-semibold text-slate-900 mt-1">Admin</p>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* PERSONAL INFORMATION */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-slate-500" />
                PERSONAL INFORMATION
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-sm font-medium text-slate-500">Name</p>
                  <p className="mt-1 font-medium text-slate-900">Admin User</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Employee ID</p>
                  <p className="mt-1 font-medium text-slate-900">EMP-001</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="mt-1 font-medium text-slate-900">admin@securedocs.demo</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Role</p>
                  <p className="mt-1 font-medium text-slate-900">Administrator</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Department</p>
                  <p className="mt-1 font-medium text-slate-900">Administration</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Status</p>
                  <p className="mt-1 font-medium text-slate-900 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span> Active
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ACCOUNT SECURITY */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5 text-slate-500" />
                ACCOUNT SECURITY
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsChangePasswordOpen(true)}>
                Change Password
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-500">Password</p>
                  <p className="mt-1 font-medium text-slate-900 text-lg tracking-widest">••••••••••••</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Last password change</p>
                  <p className="mt-1 font-medium text-slate-900">15 Aug 2026</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Two-factor authentication</p>
                  <p className="mt-1 font-medium text-slate-900 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span> Enabled
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Session status</p>
                  <p className="mt-1 font-medium text-slate-900 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span> Secure
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* LAST LOGIN */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-500" />
                LAST LOGIN
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Last login</p>
                <p className="mt-1 font-semibold text-slate-900">05 Sept 2026</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Time</p>
                <p className="mt-1 font-medium text-slate-900">09:15 AM</p>
              </div>
              <div className="flex items-start gap-2">
                <MonitorSmartphone className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Device</p>
                  <p className="font-medium text-slate-900">Windows Desktop</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Location</p>
                  <p className="font-medium text-slate-900">Ahmedabad, India</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Status</p>
                <p className="mt-1 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span> Successful
                </p>
              </div>
            </CardContent>
          </Card>

          {/* RECENT ACTIVITY */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-slate-500" />
                RECENT ACTIVITY
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                
                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-blue-100 border-2 border-blue-600"></span>
                  <p className="text-xs font-semibold text-blue-600 mb-1">09:15 AM</p>
                  <p className="text-sm font-medium text-slate-900">Successful login</p>
                  <p className="text-xs text-slate-500">Admin User</p>
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block"></span> Successful
                  </p>
                </div>

                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-slate-100 border-2 border-slate-300"></span>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Yesterday</p>
                  <p className="text-sm font-medium text-slate-900">Viewed security dashboard</p>
                  <p className="text-xs text-slate-500">Admin User</p>
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block"></span> Successful
                  </p>
                </div>

                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-slate-100 border-2 border-slate-300"></span>
                  <p className="text-xs font-semibold text-slate-500 mb-1">03 Sept 2026</p>
                  <p className="text-sm font-medium text-slate-900">Verified document integrity</p>
                  <p className="text-xs text-slate-500">Evidence.pdf</p>
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block"></span> Successful
                  </p>
                </div>

                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-slate-100 border-2 border-slate-300"></span>
                  <p className="text-xs font-semibold text-slate-500 mb-1">02 Sept 2026</p>
                  <p className="text-sm font-medium text-slate-900">Reviewed document</p>
                  <p className="text-xs text-slate-500">FIR.pdf</p>
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block"></span> Successful
                  </p>
                </div>

                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-slate-100 border-2 border-slate-300"></span>
                  <p className="text-xs font-semibold text-slate-500 mb-1">01 Sept 2026</p>
                  <p className="text-sm font-medium text-slate-900">Updated profile</p>
                  <p className="text-xs text-slate-500">Admin User</p>
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block"></span> Successful
                  </p>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
