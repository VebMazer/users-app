import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import appsApi from "../api/apps";
import { useStore } from "../utils/store";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../components/ui/tooltip";
import { BadgeInfo, RefreshCw } from "lucide-react";
import clsx from "clsx";

function HelpMe({ children }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <BadgeInfo className="w-4 h-4" />
                </TooltipTrigger>
                <TooltipContent align="start">
                    <p className="w-60">{children}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16),
    );
}

// A form page for adding and editing apps.
export default function AppForm() {
    const { user, apps, setApps } = useStore();

    const [name,    setName]    = useState("");
    const [url,     setUrl]     = useState("");
    const [appKey,  setAppKey]  = useState("");
    const [editing, setEditing] = useState(false);

    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id !== "new") setEditing(true);
    }, [id]);
    //TODO:after refresh, the form is empty
    useEffect(() => {
        if (editing === true) {
            const app = apps.find((s) => s._id === id);

            if (!app) return;

            setName(app.name);
            setUrl(app.url);
            setAppKey(app.appKey);
        }
    }, [editing]);


    if (!user || !user.admin) {
        return (
            <main className="flex flex-col grow justify-center items-center gap-2 px-4 pb-2 pt-4 sm:px-8 sm:py-4">
                <h2 className="text-3xl">
                    Vain järjestelmänvalvojilla on oikeus käyttää tätä sivua.
                </h2>
                <Link to="/" className="opacity-70 hover:opacity-100 hover:underline">
                    Mene takasin etusivulle
                </Link>
            </main>
        );
    }

    const onSubmit = (event) => {
        event.preventDefault();

        const appObject = {
            name,
            url,
            appKey,
        };

        if (editing) {
            appsApi
                .update(id, appObject)
                .then((returnedApp) => {
                    setApps(
                        apps.map((s) => (s._id !== id ? s : returnedApp)),
                    );
                    navigate("/apps");
                })
                .catch((error) => console.log("error: ", error));
        } else {
            appsApi
                .create(appObject)
                .then((returnedApp) => {
                    setApps(apps.concat(returnedApp));
                    navigate("/apps");
                })
                .catch((error) => console.log("error: ", error));
        }
    };

    return (
        <main className="flex flex-col items-center">
            <div className={clsx("flex flex-col", id !== "new" ? "gap-4" : "gap-2")}>
                <h2 className="text-xl font-bold">
                    {id !== "new"
                        ? "Edit app details"
                        : "Add a new app to the portal"}
                </h2>
                {id === "new" && (
                    <p className="text-sm opacity-70 pb-3">
                        Applications are independent apps, added to the portal SSO system.
                    </p>
                )}
                <form onSubmit={onSubmit} className="flex flex-col gap-3 max-w-md">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                            <Label htmlFor="name">App name</Label>
                            <HelpMe>
                                Give the application to be added a name, for example `shoppingcart-app'
                                in lowercase letters. Dont use spaces, because it needs to be passable
                                as a url parameter.
                            </HelpMe>
                        </div>
                        <Input
                            type="text"
                            id="name"
                            placeholder="shopping-cart-app"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                            <Label htmlFor="url">App url</Label>
                            <HelpMe>
                                Give the url of the app, for example: `https://test.com/app1`,
                                which points to the location of the app on the internet.
                            </HelpMe>
                        </div>
                        <Input
                            type="text"
                            id="url"
                            placeholder="https://portal.test.com/app1"
                            value={url}
                            onChange={(event) => setUrl(event.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-96 max-w-sm">
                        <div className="flex items-center gap-1">
                            <Label htmlFor="appKey">App key</Label>
                            <HelpMe>
                                Create a unique app key using the auto generate function or
                                manually. The key can be edited later. The key is entered into
                                the environment variables of the application in the .env file.
                            </HelpMe>
                        </div>
                        <div className="flex w-full max-w-sm items-center gap-x-2">
                            <Input id="appKey" value={appKey} onChange={(event) => setAppKey(event.target.value)} className="w-full" />
                            <Button
                                variant="ghost"
                                type="button"
                                onClick={() => setAppKey(uuidv4())}
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span className="sr-only">Luo uusi avain</span>
                            </Button>
                        </div>
                    </div>
                    <Button type="submit">Save</Button>
                </form>
            </div>
        </main>
    );
}
