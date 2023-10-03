import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Cookies from 'universal-cookie'

import userApi from '../api/users'
import authorizeApi from '../api/authorize'
import authenticateApi from '../api/authenticate'
import { useStore } from '../utils/store'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export default function Register() {
    const {
        user,
        setUser,
        publicServices
    } = useStore()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordCheck, setPasswordCheck] = useState('')

    const navigate = useNavigate()

    const [searchParams] = useSearchParams()

    // /register/?domain=test
    const domain = searchParams.get("domain")

    if (domain && !publicServices.find(s => s.domain === domain)) {
        return (
            <main className='px-4 pb-2 pt-4 sm:px-8 sm:py-4'>
                <p>URL kentän domain parametrin arvo ei sisällä mitään sallituista sivuista.</p>
            </main>
        )
    }

    if (user) {
        return (
            <main className='px-4 pb-2 pt-4 sm:px-8 sm:py-4'>
                <p>Olet kirjautunut sisään sähköpostilla: {user.email}</p>
            </main>
        )
    }

    const validate = () => {
        if (password.length < 11) {
            alert("password is too short")
            return false

        } if (password !== passwordCheck) {
            alert("passwords do not match.")
            return false

        } if (email.length < 5) {
            alert("email is too short to be valid")
            return false

        } if (!email.includes('@')) {
            alert("email is invalid")
            return false
        }

        return true
    }

    const registerAndLogin = async (event) => {
        event.preventDefault()

        if (!validate()) return

        const credentials = { password, email }

        try {
            await userApi.create(credentials)

            const authenticatedUser = await authenticateApi.authenticate(credentials)

            if (authenticatedUser) {
                authorizeApi.setToken(authenticatedUser.token)
                const cookies = new Cookies()

                cookies.set('usersToken', authenticatedUser.token, {
                    // Cookie expires in 60 days.
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
                    path: '/'
                })

                setUser(authenticatedUser)

                navigate('/')

            } else alert("Failed to login")

        } catch (exception) {
            alert("Registration failed on the server.")
        }

    }

    return (
        <main className='flex flex-col min-h-0 flex-1 gap-3 px-4 pb-2 pt-4 sm:px-8 sm:py-4'>
            <div className="flex flex-col grow justify-center items-center">
                <div className='flex flex-col w-full max-w-xs gap-2'>
                    <h2 className="text-xl">Luo käyttäjä Intranettiin</h2>

                    <p className="text-xs opacity-70" >
                        Muista käyttää etunimi.sukunimi@edu.hel.fi sähköpostia
                    </p>
                    <form onSubmit={registerAndLogin} className='flex flex-col gap-3'>
                        <div className=''>
                            <Label htmlFor='email'>Sähköposti</Label>
                            <Input
                                id='email'
                                type="text"
                                value={email}
                                onChange={event => setEmail(event.target.value)}
                                className="textInput"
                            />
                        </div>
                        <div className=''>
                            <Label htmlFor='password'>Salasana</Label>
                            <Input
                                id='password'
                                type="password"
                                value={password}
                                onChange={event => setPassword(event.target.value)}
                                className="textInput"
                            />
                        </div>
                        <div className=''>
                            <Label htmlFor='confirm' >Salasana uudelleen</Label>
                            <Input
                                id='confirm'
                                type="password"
                                value={passwordCheck}
                                onChange={event => setPasswordCheck(event.target.value)}
                                className="textInput"
                            />
                        </div>
                        <Button type="submit">Rekisteröidy</Button>
                    </form>
                </div>
            </div>
        </main>
    )
}
