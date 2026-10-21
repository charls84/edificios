import { getTranslations } from 'next-intl/server'
import { enterDemo } from '../services/actions'

export async function DemoLogin() {
  const t = await getTranslations('auth')
  return (
    <form action={enterDemo} className="space-y-4">
      <p className="rounded-xl bg-piedra px-3 py-2 text-sm text-torna">
        {t.rich('demoTexto', { b: (texto) => <strong>{texto}</strong> })}
      </p>
      <button type="submit" className="boton">{t('entrarDemo')}</button>
    </form>
  )
}
