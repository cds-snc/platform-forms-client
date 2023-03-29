import React, { createContext, useState, useContext, useRef } from "react";

interface MenuContextType {
    id: string;
    closeAll: () => void;
}

const defaults: MenuContextType = {
    id: "",
    closeAll: () => void 0,
};

const MenuContext = createContext<MenuContextType>(defaults);

export function MenuProvider({ children }: { children: React.ReactNode }) {
    const [id, setId] = useState("");

    const closeAll = () => {
        setId(Math.random().toString(36).substring(7));
    };

    return (
        <MenuContext.Provider value={{ id, closeAll }}>
            {children}
        </MenuContext.Provider>
    )
}

export const useMenuContext = () => useContext(MenuContext);
