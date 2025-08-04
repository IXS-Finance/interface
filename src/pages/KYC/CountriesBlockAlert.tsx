import React from 'react'
import usaFlag from 'assets/images/new-dark-ui/kyc/usa.svg'
import northKoreaFlag from 'assets/images/new-dark-ui/kyc/north-korea.svg'
import myanmarFlag from 'assets/images/new-dark-ui/kyc/myanmar.svg'
import iranFlag from 'assets/images/new-dark-ui/kyc/iran.svg'
import singaporeFlag from 'assets/images/new-dark-ui/kyc/singapore.svg'

// Warning icon component
const AlertIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <g opacity="0.5">
      <path
        d="M16.7024 17.4995H3.29756C2.01587 17.4995 1.21383 16.1132 1.85272 15.0021L8.55518 3.34565C9.19602 2.23114 10.804 2.23113 11.4448 3.34564L18.1474 15.0021C18.7862 16.1132 17.9842 17.4995 16.7024 17.4995Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M10 7.5V10.8333" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M10 14.1753L10.0083 14.166"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
)

// Country flag components (simplified placeholders)
const CountryFlags: React.FC = () => (
  <div className="flex relative">
    {/* USA Flag */}
    <div
      className="w-6 h-6 rounded-full relative z-10"
      style={{ marginLeft: '0px' }}
    >
      <img src={usaFlag} alt="USA Flag" className="w-full h-full rounded-full" />
    </div>

    {/* North Korea Flag */}
    <div
      className="w-6 h-6 rounded-full relative z-20"
      style={{ marginLeft: '-8px' }}
    >
      <img src={northKoreaFlag} alt="North Korea Flag" className="w-full h-full rounded-full" />
    </div>

    {/* Myanmar Flag */}
    <div
      className="w-6 h-6 rounded-full relative z-30"
      style={{ marginLeft: '-8px' }}
    >
      <img src={myanmarFlag} alt="Myanmar Flag" className="w-full h-full rounded-full" />
    </div>

    {/* Iran Flag */}
    <div
      className="w-6 h-6 rounded-full relative z-40"
      style={{ marginLeft: '-8px' }}
    >
      <img src={iranFlag} alt="Iran Flag" className="w-full h-full rounded-full" />
    </div>

    {/* Singapore Flag */}
    <div
      className="w-6 h-6 rounded-full relative z-50"
      style={{ marginLeft: '-8px' }}
    >
      <img src={singaporeFlag} alt="Singapore Flag" className="w-full h-full rounded-full" />
    </div>
  </div>
)

const CountriesBlockAlert: React.FC = () => {
  return (
    <div className="bg-[#202126] border border-[#353840] rounded-2xl p-8 flex items-center justify-between">
      {/* Left side - Icon and Text */}
      <div className="flex items-center gap-6">
        <AlertIcon />

        <div className="font-medium text-18 text-white/50 leading-relaxed">
          <p className="leading-[1.4] mb-0">
            <span>Our service is currently unavailable to citizens of the </span>
            <span className="text-white">United States</span>
            <span>, </span>
          </p>
          <p className="leading-[1.4]">
            <span className="text-white">North Korea</span>
            <span>, </span>
            <span className="text-white">Myanmar (formerly Burma)</span>
            <span>, </span>
            <span className="text-white">Iran</span>
            <span>, and </span>
            <span className="text-white">Singapore</span>
            <span>.</span>
          </p>
        </div>
      </div>

      {/* Right side - Country Flags */}
      <CountryFlags />
    </div>
  )
}

export default CountriesBlockAlert
