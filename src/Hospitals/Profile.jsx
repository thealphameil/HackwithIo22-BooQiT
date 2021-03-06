import avatar from './avatar.png'
import styles from './Clinic.module.css'
import { ArrowBackIosRounded, EditRounded } from '@material-ui/icons'
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../App'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db, storage } from '../firebase'
import { CircularProgress } from '@material-ui/core'

const ClinicProfile = () => {

    const navigate = useNavigate()

    const context = useContext(AppContext)
    
    const [ data, setData ] = useState({})
    const [ email, setEmail ] = useState('')
    const [ phone, setPhone ] = useState('')
    const [ address, setAddress ] = useState('')
    const [ city, setCity ] = useState('')
    const [ date, setDate ] = useState('')
    const [ file, setFile ] = useState('')
    const [ url, setUrl ] = useState('')

    const [ isLoading, setIsLoading ] = useState(false)
    
    const clinic = localStorage.getItem('clinic')

    useEffect(() => {

        if (context.userDetails) {

            setData({
                profilepic: context.userDetails.profilepic,
                name: context.userDetails.name,
                phone: context.userDetails.phone,
                address: context.userDetails.address,
                email: context.userDetails.email,
                city: context.userDetails.city,                
            })
            
            setUrl(context.userDetails.profilepic)
            setEmail(context.userDetails.email)
            setPhone(context.userDetails.phone)
            setAddress(context.userDetails.address)
            setCity(context.userDetails.city)
            const date = new Date(context.userDetails.timeStamp.seconds * 1000)
            setDate(date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear())
        }
            
    }, [ context ])

    useEffect(() => {

        const uploadPicture = () => {

            setIsLoading(true)

            const name = new Date().getTime() + file.name
            const storageRef = ref(storage, name);

            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', 
            (snapshot) => {

                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
                }
            }, 
            (error) => {
                console.log(error);
                setIsLoading(false)
            }, 
            () => {
                getDownloadURL(uploadTask.snapshot.ref)
                .then((downloadURL) => {
                setUrl(downloadURL)
                setIsLoading(false)
                })
            })

        }

        file && uploadPicture()

    }, [ file ])

    const handleSave = async () => {

        setIsLoading(true)

        const userRef = doc(db, "clinics", clinic);

        await updateDoc(userRef, {
            email, phone, address, city, profilepic: url
        })
        .then(() => console.log('Updated'))
        .then(() => setIsLoading(false))
        .then(() => window.location.reload())
        .catch((error) => {
            console.log(error)
            setIsLoading(false)
            alert('One of the fields above is empty')
        })
    }
    
    useEffect(() => {
        
        if (!context.userDetails) {
            const getName = async () => {
		
                const docRef = doc(db, "clinics", clinic);
                const docSnap = await getDoc(docRef);
            
                if (docSnap.exists()) {
                    context.setUserDetails(docSnap.data())
                } else {
                    localStorage.clear()
                    window.location.reload()
                }
            }
        
            getName()
        }

    }, [])

  return context.userDetails ? (
    <main className={styles.edit}>
        <header>
            <div className={styles.pictureandname}>
                <div className={styles.avatar}>
                    <img src={url ? url : avatar} />
                    {/* <div className={styles.picChange}> */}
                        <input type='file' id='img' style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
                        <label htmlFor='img' className={styles.change}>
                            <EditRounded />
                        </label>
                    {/* </div> */}
                </div>
                <div className={styles.username}>
                    {context.userDetails.name}
                </div>
            </div>
            {
            isLoading && <div className={styles.progresswrapper}>
                <CircularProgress className={styles.progress} />
            </div>
            }
        </header>
        <section>

            <div className={styles.eachfield}>
                <div>
                    EMAIL ADDRESS
                </div>
                <input defaultValue={context.userDetails.email} disabled />
            </div>

            <div className={styles.eachfield}>
                <div>
                    HOSPITAL PHONE
                </div>
                <input defaultValue={context.userDetails.phone || ''} placeholder='Enter your phone number' onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className={styles.eachfield}>
                <div>
                    ADDRESS
                </div>
                <input defaultValue={context.userDetails.address || ''} placeholder='Enter your residence' onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className={styles.eachfield}>
                <div>
                    CITY
                </div>
                <input defaultValue={context.userDetails.city || ''} placeholder='Enter your city' onChange={(e) => setCity(e.target.value)} />
            </div>

        </section>
        <section className={styles.save}>
            <button onClick={handleSave}>
                Save Changes
            </button>
        </section>
    </main>
  ) : (
    <main>
        <CircularProgress className={styles.progress} />
    </main>
  )
}

export default ClinicProfile