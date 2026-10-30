'use client'

import { useEffect } from 'react'

// Si un enlace de correo termina en otra pagina (por ejemplo /login) con la sesion o el
// error en el fragmento (#...), lo pasa a /confirmar, que sabe leerlo.
export function ReenvioHash() {
  useEffect(() => {
    const hash = window.location.hash
    if (/access_token=|error_code=/.test(hash)) {
      window.location.replace(`/confirmar?next=/update-password${hash}`)
    }
  }, [])
  return null
}
