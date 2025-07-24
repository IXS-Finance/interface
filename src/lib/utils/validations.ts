import { isAddress } from '@ethersproject/address'
import numeral from 'numeral'

import { bnum } from '.'

export function isRequired(field = '') {
  const label = field || 'Field'
  return (v: any) => !!v || `${label} is required`
}

export function minChar(minLength: number, field = '') {
  const _field = field ? `${field} ` : ''
  return (v: any) => !v || v.length >= minLength || `${_field} must be at least ${minLength} characters`
}

export function isPositiveCheck(number: number | string) {
  return bnum(number).isGreaterThanOrEqualTo(0)
}
export function isPositive() {
  return (v: any) => !v || isPositiveCheck(numeral(v).value() || 0) || 'must be a positive number'
}

export function isLessThanOrEqualTo(max: number | string, msg = '') {
  return (v: any) => !v || bnum(v).isLessThanOrEqualTo(max) || (msg ? msg : `must be less than ${max}`)
}

export const isEmailCheck = (email: string) => {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return regex.test(String(email).toLowerCase())
}

export function isEmail() {
  return (v: any) => !v || isEmailCheck(v) || 'must be a valid email'
}

export function isValidAddress() {
  return (v: any) => !v || isAddress(v) || 'This is not a valid Ethereum address'
}

export function isGreaterThan(min: number | string, msg = '') {
  return (v: any) => !v || bnum(v).isGreaterThan(min) || (msg ? msg : `Must be greater than ${min}`)
}

export function isTxHash() {
  const regex = /^0x([A-Fa-f0-9]{64})$/
  return (v: any) => !v || regex.test(v) || 'Must be valid transaction hash'
}
