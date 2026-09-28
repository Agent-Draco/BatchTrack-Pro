'use client'
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserProfile, createUserProfile, createDefaultZones, createWallet } from '@/lib/firestore'
import { getCommunityKey } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const { user, profile, isLoading, error, setUser, setProfile, setLoading, clearError, signOut } = useAuthStore()

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)

      if (!firebaseUser) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setUser(firebaseUser)

      try {
        let userProfile = await getUserProfile(firebaseUser.uid)

        if (!userProfile) {
          await createUserProfile(firebaseUser.uid, {
            email:       firebaseUser.email ?? '',
            displayName: firebaseUser.displayName ?? 'Orbit User',
            photoURL:    firebaseUser.photoURL ?? '',
            location:    { city: '', state: '', country: '' },
            creditBalance: 50,
            pairingMode: 'passive',
            clusterId: getCommunityKey('unknown', 'unknown'),
            buildingId: getCommunityKey('unknown', 'unknown'),
            pairingDisplayName: (firebaseUser.displayName ?? 'Orbit User').split(' ')[0],
            profileVisibility: 'matched',
            createdAt:   new Date(firebaseUser.metadata.creationTime ?? Date.now()),
            lastActive:  new Date(),
          })
          await createWallet(firebaseUser.uid)
          await createDefaultZones(firebaseUser.uid)
          userProfile = await getUserProfile(firebaseUser.uid)
        }

        setProfile(userProfile)
      } catch (err) {
        console.error('Failed to load user profile:', err)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsub()
  }, [setUser, setProfile, setLoading])

  return { user, profile, isLoading, error, clearError, signOut }
}
