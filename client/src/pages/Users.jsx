import { useState, useEffect, useCallback } from 'react'
import appsApi from '../api/apps'
import usersApi from '../api/users'
import { useStore } from '../utils/store'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '../components/ui/dropdown-menu'
import { Button } from '../components/ui/button'
import { MoreHorizontalIcon } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"
import { Link } from 'react-router-dom'

const accessLevels = [
    { role: 'user', accessLevel: 1 },
    { role: 'content editor', accessLevel: 2 },
    { role: 'admin', accessLevel: 3 }
]

function SetAccessLevel({ user }) {
    const { apps, users, setUsers } = useStore()

    const [accessLevel, setAccessLevel] = useState(1)
    const [app, setApp] = useState(apps[0])

    const uploadAccessLevel = async level => {
        try {
            const access = user.access.find(a => a.appName === app.name)

            if (access) access.level = level
            else {
                user.access.push({
                    appName: app.name,
                    level
                })
            }

            const updatedUser = await usersApi.update(user._id, user)

            setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u))

        } catch (exception) { console.log('exception: ', exception) }
    }

    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className=''>Define user specific access to apps</DialogTitle>
                <DialogDescription>
                    Chane access user access levels. Press Save when you are ready.
                </DialogDescription>
            </DialogHeader>
            <div className="flex items-end gap-4 py-4">
                <div className='flex flex-col gap-2'>
                    <Label htmlFor="access level" className="">
                        Access level
                    </Label>

                    <Select onValueChange={(value) => setAccessLevel(value)}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>access level</SelectLabel>
                                {accessLevels.map((access) => <SelectItem key={access.accessLevel} value={access.accessLevel}>{access.role}</SelectItem>)}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="access level" className="">
                        Application
                    </Label>
                    <Select
                        onValueChange={(value) =>
                            setApp(apps.find(s => s._id === value))
                        }>
                        <SelectTrigger className="w-52">
                            <SelectValue placeholder="Select application" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Application</SelectLabel>
                                {apps.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button
                    variant='destructive'
                    onClick={() => uploadAccessLevel(0)}
                >
                    Remove
                </Button>
                <Button variant='default' onClick={() => uploadAccessLevel(accessLevel)}>
                    Save
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

function TableOptions({ u }) {
    const [open, setOpen] = useState(false)
    const { users, setUsers } = useStore()

    const toggleAdmin = async (u) => {
        try {
            u.admin = !u.admin
            const updatedUser = await usersApi.update(u._id, u)

            setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u))

        } catch (exception) { console.log('exception: ', exception) }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DropdownMenu>
                    <DropdownMenuTrigger >
                        <div
                            className="inline-flex items-center justify-center h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        >
                            <MoreHorizontalIcon className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                        <DialogTrigger asChild>
                            <DropdownMenuItem>Set app access</DropdownMenuItem>
                        </DialogTrigger>
                        <DropdownMenuItem onClick={() => toggleAdmin(u)} >
                            {u.admin ? 'Remove admin access' : 'Add admin access'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={async () => {
                            if (confirm('Are you sure you want to delete the user?')) {
                                await usersApi.remove(u._id)
                                setUsers(users.filter(user => user._id !== u._id))
                            }
                        }}>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <SetAccessLevel user={u} />
            </Dialog>
        </>
    )
}

export default function Users() {
    const {
        user,
        users,
        apps,
        setUsers,
        setApps
    } = useStore()

    const loadUsers = useCallback(async () => {
        if (user && user.admin) {
            try {
                setUsers(await usersApi.getAll())

            } catch (exception) { console.log('exception: ', exception) }
        }
    }, [user])

    const loadApps = useCallback(async () => {
        if (user && user.admin) {
            try {
                setApps(await appsApi.getAll())

            } catch (exception) { console.log('exception: ', exception) }
        }
    }, [user])

    useEffect(() => {
        loadUsers()
        loadApps()
    }, [user])

    if (!user || !user.admin) {
        return (
            <main className='flex flex-col grow justify-center items-center gap-2 px-4 pb-2 pt-4 sm:px-8 sm:py-4'>
                <h2 className='text-3xl'>Vain järjestelmänvalvojilla on oikeus käyttää tätä sivua.</h2>
                <Link to='/' className='opacity-70 hover:opacity-100 hover:underline'>Mene takasin etusivulle</Link>
            </main>
        )
    }

    return (
        <main className='flex flex-col justify-center items-center px-4 pb-2 pt-4 sm:px-8 sm:py-4'>
            <div className='flex flex-col items-start w-full max-w-5xl gap-2'>
                <h2 className='text-3xl font-bold'>Portal access management control</h2>
                <p className='opacity-70'>
                    In this page a portal admin can edit users application specific access levels.
                </p>
                <Table>
                    <TableCaption>List of application specific access levels.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Email</TableHead>
                            <TableHead>Access levels</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.sort((a, b) => a.email > b.email ? 1 : -1).map((u) => (
                            <TableRow key={u._id}>
                                <TableCell className="font-medium">{u.email}</TableCell>
                                <TableCell>
                                    <ul className="flex flex-col">
                                        {u.access.map(a => {

                                            const access = accessLevels.find(level => level.accessLevel === a.level)

                                            return (
                                                <li key={a.appName + u._id}>
                                                    {a.appName}: {access?.role || a.level}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </TableCell>
                                <TableCell>
                                    {u.admin ? 'Admin' : 'User'}
                                </TableCell>
                                <TableCell>
                                    <TableOptions u={u} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </main>
    )
}
