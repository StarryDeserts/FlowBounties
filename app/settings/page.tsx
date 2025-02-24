"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Wallet, Bell, Shield, Moon, Sun } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6 animate-fadeIn">
      <h1 className="text-3xl font-bold text-[var(--h2o-accent)] mb-8">Settings</h1>

      {/* Theme Settings */}
      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="flex items-center text-[var(--h2o-accent)]">
            <Sun className="w-5 h-5 mr-2" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how H2O Bounty looks on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
              className="data-[state=checked]:bg-[var(--h2o-primary)]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="flex items-center text-[var(--h2o-accent)]">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Task Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about task status changes
              </p>
            </div>
            <Switch defaultChecked className="data-[state=checked]:bg-[var(--h2o-primary)]" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">New Tasks</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new tasks are posted
              </p>
            </div>
            <Switch defaultChecked className="data-[state=checked]:bg-[var(--h2o-primary)]" />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="flex items-center text-[var(--h2o-accent)]">
            <Shield className="w-5 h-5 mr-2" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button 
              variant="outline"
              className="hover:bg-[var(--h2o-secondary)] hover:text-[var(--h2o-accent)] click-scale"
            >
              Enable
            </Button>
          </div>
          <Separator />
          <div className="space-y-4">
            <Label className="text-base">Session Management</Label>
            <Select defaultValue="30days">
              <SelectTrigger className="w-full md:w-[280px] focus:ring-[var(--h2o-primary)]">
                <SelectValue placeholder="Select session duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 days</SelectItem>
                <SelectItem value="30days">30 days</SelectItem>
                <SelectItem value="90days">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Settings */}
      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="flex items-center text-[var(--h2o-accent)]">
            <Wallet className="w-5 h-5 mr-2" />
            Wallet
          </CardTitle>
          <CardDescription>
            Manage your connected wallet and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Connected Wallet</Label>
              <p className="text-sm text-muted-foreground">
                0x1234...5678
              </p>
            </div>
            <Button 
              variant="outline"
              className="hover:bg-[var(--h2o-secondary)] hover:text-[var(--h2o-accent)] click-scale"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive hover-elevate">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                className="w-full sm:w-auto click-scale"
              >
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:bg-[var(--h2o-secondary)] hover:text-[var(--h2o-accent)] click-scale">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction className="bg-destructive hover:bg-destructive/90 click-scale">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}

