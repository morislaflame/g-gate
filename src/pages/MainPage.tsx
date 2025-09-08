import BetWindow from "@/components/BetWindow";
import { Context, type IStoreContext } from "@/store/StoreProvider";
import { useContext } from "react";

const MainPage = () => {
    const { user } = useContext(Context) as IStoreContext;

    return (
        <div className="flex flex-col justify-end h-full w-full p-5">
            <BetWindow userBalance={user.userBalance} />
        </div>
    )
}

export default MainPage;