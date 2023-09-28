import { accounts } from './accounting/accounts'
import { addresses } from './accounting/addresses'
import { attachments } from './accounting/attachments'
import { balanceSheets } from './accounting/balanceSheets'
import { cashFlowStatements } from './accounting/cashFlowStatements'
import { companyInfo } from './accounting/companyInfo'
import { creditNotes } from './accounting/creditNotes'
import { expenses } from './accounting/expenses'
import { incomeStatements } from './accounting/incomeStatements'
import { invoices } from './accounting/invoices'
import { items } from './accounting/items'
import { companies } from './hris/companies'
import { employees } from './hris/employees'
import { locations } from './hris/locations'
import { payGroups } from './hris/paygroups'

export const mergeSheets = {
  accounting: [
    accounts,
    addresses,
    attachments,
    balanceSheets,
    cashFlowStatements,
    companyInfo,
    creditNotes,
    expenses,
    incomeStatements,
    invoices,
    items,
    // journalEntries,
    // payments,
    // phoneNumbers,
    // purchaseOrders,
    // taxRates,
    // trackingCategories,
    // transactions,
    // vendorCredits,
  ],
  hris: [
    // bankInfo,
    // benefits,
    companies,
    // dependents,
    // employeePayrollRuns,
    employees,
    // employerBenefits,
    // employments,
    // groups,
    locations,
    payGroups,
    // payrollRuns,
    // timeOff,
    // timeOffBalances,
  ],
}
