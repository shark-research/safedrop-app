"use client"

interface InfoProps {
  current: 'bingx' | 'bitget' | 'bybit' | 'gate' | 'kraken' | 'kucoin' | 'mexc' | 'okx' | 'binance';
  open: boolean;
  setOpen: (b: boolean) => void;
}

export const Info = ({current, open, setOpen}: InfoProps) => {
  const data = {
    bingx: (
      <>
        <p className="mb-4">
          Go to the exchange settings and create api keys with the following permissions.
        </p>
        <img className="w-full mb-4" src="/assets/bingx/screen1.jpg" alt=""/>
      </>
    ),
    bitget: (
      <>
        <p className="mb-4">
          Go to the exchange settings and create api keys with the following permissions.
        </p>
        <img className="w-full mb-4" src="/assets/bitget/screen1.jpg" alt=""/>
        <img className="w-full mb-4" src="/assets/bitget/screen2.jpg" alt=""/>
      </>
    ),
    bybit: (
      <>
        <p className="mb-4">
          Go to the exchange settings and create api keys with the following permissions.
        </p>
        <img className="w-full mb-4" src="/assets/bybit/screen1.jpg" alt=""/>
        <img className="w-full mb-4" src="/assets/bybit/screen2.jpg" alt=""/>
      </>
    ),
    gate: (
      <>
        <p className="mb-4">
          Go to the exchange settings and create api keys with the following permissions.
        </p>
        <img className="w-full mb-4" src="/assets/gate/screen1.jpg" alt=""/>
      </>
    ),
    kraken: (
      <>
        <p className="mb-4">
          Go to the exchange settings and create api keys with the following permissions.
        </p>
        <img className="w-full mb-4" src="/assets/kraken/screen1.jpg" alt=""/>
      </>
    ),
    kucoin: (
      <>
        <p className="mb-4">
          Go to the exchange settings and create api keys with the following permissions.
        </p>
        <img className="w-full mb-4" src="/assets/kucoin/screen1.jpg" alt=""/>
      </>
    ),
    mexc: (
      <>
        <p className="mb-4">
          Go to the exchange settings and create api keys with the following permissions.
        </p>
        <img className="w-full mb-4" src="/assets/mexc/screen1.jpg" alt=""/>
      </>
    ),
    okx: (
      <>
        <p className="mb-4">
          Go to the exchange settings and create api keys with the following permissions.
        </p>
        <img className="w-full mb-4" src="/assets/okx/screen1.jpg" alt=""/>
      </>
    ),
    binance: (
      <>
        <p className="mb-4">
          Go to the exchange settings and create api keys with the following permissions.
        </p>
        <img className="w-full mb-4" src="/assets/binance/screen2.png" alt=""/>
        <img className="w-full mb-4" src="/assets/binance/screen1.png" alt=""/>
      </>
    ),
  };

  return (
    <main
      className={`absolute top-0 left-0 pt-8 pb-16 lg:pt-16 lg:pb-24 bg-dark antialiased min-h-screen w-full transition-all ${open ? 'opacity-100 z-10' : 'opacity-0'}`}>
      <div className="flex justify-between px-4 mx-auto max-w-screen-xl ">
        <article
          className="mx-auto w-full max-w-4xl format format-sm sm:format-base lg:format-lg format-invert">
          <header className="mb-4 lg:mb-6 not-format">

            <button
              className="flex flex-row align-middle mb-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <svg className="w-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="ml-2">Back</p>
            </button>

            <h1
              className="mb-4 lg:mb-6 text-3xl font-extrabold leading-tight text-gray-900 lg:text-4xl text-white">
              How to create API keys
            </h1>
          </header>
          {data[current]}
        </article>
      </div>
    </main>
  )
}
