
import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import Instant from '@/components/instant/instant';
import Instance from '@/models/instance';
import { useState } from 'react';

import { useRouter } from 'next/router'

import useCheck from '@/utils/check';

import s from './feed.module.scss';
import l from '@/styles/loader.module.scss';


export default function Feed() {

    let router = useRouter();
    useCheck();

    let [instances, setInstances] = useState<{ [key: string]: Instance }>({})
    let [loading, setLoading] = useState<boolean>(true);
    let [failure, setFailure] = useState<string>("");

    useEffect(() => {

        setLoading(true);
        let token = localStorage.getItem("token");
        let body = JSON.stringify({ "token": token });

        let options = {
            url: "/api/feed",
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            data: body,
        }
        

        axios.request(options).then(
            async (response) => {
                
                console.log("response.data")
                console.log(response.data);
                let newinstances: { [key: string]: Instance } = {};

                async function createInstance(data: any) {
                    let id = data.id;
                    let newinstance = await Instance.create(data);
                    newinstances[id] = newinstance;
                    /* console.log("newinstances");
                    console.log(newinstances); */

                    setLoading(false);
                }

                for (let i = 0; i < response.data.length; i++) {
                    try {
                        await createInstance(response.data[i]);
                        setInstances({...newinstances});
                        setLoading(false);
                    } catch (error) {
                        console.log("CULDNT MAKE INSTANCE WITH DATA: ", response.data[i])
                        console.log(error);
                    }
                    
                }
                console.log("newinstances");
                console.log(newinstances);
                setLoading(false);
            }
        ).catch(
            (error) => {
                console.log(error);
                setLoading(false);
                setFailure(JSON.stringify(error.response.data.error));
                setTimeout(() => {setFailure("")}, 5000);
            }
        )

    }, [])

    return (
        <div className={s.feed}>
            {
                failure ? 
                    <div className={s.failure}>
                        <div className={s.error}>{failure}</div>
                        <div className={s.help}>something went wrong, please try refreshing the page or re-login</div>
                    </div> 
                : ''
            }
            {
                loading ? <div className={l.loader}></div> :
                (
                    Object.keys(instances).length > 0 ? 
                    Object.keys(instances).map((key, idx) => {
                        return (
                            <Instant key={idx} instance={instances[key]} />
                        )
                    }) :
                    <div className={s.nothing}>
                        It's quiet here, nobody has posted anything yet.
                    </div>
                )
            }
        </div>
    )
}