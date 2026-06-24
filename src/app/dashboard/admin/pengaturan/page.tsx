import { getOfficeSettings } from '@/app/actions/office'
import { getHolidays } from '@/app/actions/holiday'
import OfficeSettingsForm from './OfficeSettingsForm'

export const dynamic = 'force-dynamic'

export default async function OfficeSettingsPage() {
  const settings = await getOfficeSettings()
  const holidays = await getHolidays()

  return <OfficeSettingsForm initialSettings={settings} initialHolidays={holidays} />
}
