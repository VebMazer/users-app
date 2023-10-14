import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import appsApi from "../api/apps";
import { useStore } from "../utils/store";
import { Button } from "../components/ui/button";
import {
  EyeIcon,
  EyeOffIcon,
  MoreHorizontalIcon,
  PlusIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

function MoreOptions({ app }) {
  const { apps, setApps } = useStore();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => navigate(`/apps/${app._id}`)}>
          edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            appsApi
              .remove(app._id)
              .then(() => {
                setApps(apps.filter((s) => s._id !== app._id));
              })
              .catch((error) => console.log("error: ", error));
          }}
        >
          delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CopyToClip({ app }) {
  const [copy, setCopy] = useState(false);
  const copyUrlToClipboard = (key) => {
    setCopy(true);
    navigator.clipboard.writeText(key);
    setTimeout(() => setCopy(false), 1000);
  };

  return (
    <>
      {app.showAppKey ? (
        <button
          className="max-w-[100px] whitespace-nowrap"
          onClick={() => copyUrlToClipboard(app.appKey)}
        >
          <p>{copy ? "kopioitu" : app.appKey}</p>
        </button>
      ) : (
        <button
          className=""
          onClick={() => copyUrlToClipboard(app.appKey)}
        >
          <p>{copy ? "kopioitu" : "********"}</p>
        </button>
      )}
    </>
  );
}

function AppItems() {
  const apps = useStore((state) => state.apps);
  const setApps = useStore((state) => state.setApps);

  const showOrHideAppKey = (app) => {
    app.showAppKey = !app.showAppKey;

    setApps(apps);
  };
  if (!apps || apps.length === 0) {
    return (
      <TableRow>
        <TableCell>0 Applications</TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {apps.map((app) => (
        <TableRow key={app._id}>
          <TableCell>{app.name}</TableCell>
          <TableCell>{app.url}</TableCell>
          <TableCell className="overflow-hidden">
            <CopyToClip app={app} />
          </TableCell>
          <TableCell className="flex gap-5">
            <Button
              variant="ghost"
              className="p-2"
              onClick={() => showOrHideAppKey(app)}
            >
              {app.showAppKey ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </Button>
          </TableCell>
          <TableCell>
            <MoreOptions app={app} />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function Apps() {
  const { user, setApps } = useStore();

  const navigate = useNavigate();

  const getApps = async () => {
    if (user && user.admin) {
      try {
        let appEntries = await appsApi.getAll();

        appEntries.forEach((s) => (s.showAppKey = false));

        setApps(appEntries);
      } catch (exception) {
        console.log("exception: ", exception);
      }
    }
  };

  useEffect(() => {
    getApps();
  }, [user]);

  if (!user || !user.admin) {
    return (
      <main className="flex flex-col grow justify-center items-center gap-2 px-4 pb-2 pt-4 sm:px-8 sm:py-4">
        <h2 className="text-3xl">
          Only Portal administrators have access to this page.
        </h2>
        <Link to="/" className="opacity-70 hover:opacity-100 hover:underline">
          Go back to the front page.
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-col justify-center items-center px-4 pb-2 pt-4 sm:px-8 sm:py-4">
      <div className="flex flex-col items-start w-full max-w-5xl gap-2">
        <h2 className="text-3xl">Portal App Management</h2>
        <p className="opacity-70">
          In this page a Portal administrator can add, remove and edit apps
          belonging to the portal and adjust their permissions.
        </p>
        <Button
          variant="outline"
          className=""
          onClick={() => navigate("/apps/new")}
        >
          <PlusIcon />
          <span className="sr-only">Add application</span>
        </Button>
        <Table>
          <TableCaption>List of Portal apps</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-56">Name</TableHead>
              <TableHead className="w-56">Url</TableHead>
              <TableHead className="w-40">Key</TableHead>
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-10 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AppItems />
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
