import React, { useState } from 'react';
import Notifications from './header/Notifications';
import UserMenu from './header/UserMenu';
import SearchModal from './header/SearchModal';
import Help from './header/Help';
//COMPONENT
import RunningChecker from '../components/RunningChecker/RunningChecker'


function Header({sidebarOpen,setSidebarOpen,onboardPage = false}) {

    const [searchModalOpen, setSearchModalOpen] = useState(false)

    function onboardPageSection() {
        return (
            <div className="flex items-center max-w-full" style={{width: "100%"}}>
                {/* <div className="flex-none w-32">
                    <img src={logo} alt="Logo" />
                </div> */}

                <div style={{width: "100%"}}>
                    {/* <RunningChecker/> */}
                </div>

            </div>
        )
    }

    function defaultPageSection() {
        return (
            <>
                <div className="flex">

                    <button
                        className="text-slate-500 hover:text-slate-600 lg:hidden"
                        aria-controls="sidebar"
                        aria-expanded={sidebarOpen}
                        onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <rect x="4" y="5" width="16" height="2" />
                            <rect x="4" y="11" width="16" height="2" />
                            <rect x="4" y="17" width="16" height="2" />
                        </svg>
                    </button>

                </div>

                <div className="flex items-center">
                    <Notifications />
                        <hr className="w-px h-6 bg-slate-200 mx-3" />
                    <UserMenu />
                </div>
            </>
        )
    }

    return (
        <header className="sticky top-0 border-b border-slate-200 z-30 bg-slate-800">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 -mb-px">

                    {onboardPage ? onboardPageSection() : defaultPageSection()}

                </div>
            </div>
        </header>
    );
}

export default Header;