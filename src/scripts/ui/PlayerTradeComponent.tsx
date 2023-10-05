import classNames from "classnames";
import { useEffect, useState } from "react";
import { IPendingClaim } from "../../../server/src/Database";
import { Resource } from "../definitions/ResourceDefinitions";
import { Tick } from "../logic/TickLogic";
import { IBuildingData } from "../logic/Tile";
import { client, OnNewPendingClaims, useTrades, useUser } from "../rpc/RPCClient";
import { useTypedEvent } from "../utilities/Hook";
import { L, t } from "../utilities/i18n";
import { AddTradeComponent } from "./AddTradeComponent";
import { FillPlayerTradeModal } from "./FillPlayerTradeModal";
import { showModal } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { IBuildingComponentProps } from "./PlayerMapPage";

export function PlayerTradeComponent({ gameState, xy }: IBuildingComponentProps) {
   const building = gameState.tiles[xy].building;
   if (!building) {
      return null;
   }
   const trades = useTrades();
   const user = useUser();
   const [pendingClaims, setPendingClaims] = useState<IPendingClaim[]>([]);
   useEffect(() => {
      client.getPendingClaims().then(setPendingClaims);
   }, []);
   useTypedEvent(OnNewPendingClaims, () => {
      client.getPendingClaims().then(setPendingClaims);
   });

   return (
      <fieldset>
         <legend>{t(L.PlayerTrade)}</legend>
         <PendingClaimComponent pendingClaims={pendingClaims} building={building} />
         <AddTradeComponent gameState={gameState} xy={xy} />
         <div className="table-view">
            <table>
               <tbody>
                  <tr>
                     <th>{t(L.PlayerTradeWant)}</th>
                     <th>{t(L.PlayerTradeOffer)}</th>
                     <th>{t(L.PlayerTradeFrom)}</th>
                     <th></th>
                  </tr>
                  {trades.map((trade) => {
                     const disableFill = user == null || trade.fromId == user.userId;
                     return (
                        <tr key={trade.id}>
                           <td>
                              {Tick.current.resources[trade.buyResource].name()} x{" "}
                              <FormatNumber value={trade.buyAmount} />
                           </td>
                           <td>
                              {Tick.current.resources[trade.sellResource].name()} x{" "}
                              <FormatNumber value={trade.sellAmount} />
                           </td>
                           <td>{trade.from}</td>
                           <td>
                              <div
                                 className={classNames({
                                    "text-link": !disableFill,
                                    "text-strong": true,
                                    "text-desc": disableFill,
                                 })}
                                 onClick={() => {
                                    if (!disableFill) {
                                       showModal(<FillPlayerTradeModal trade={trade} xy={xy} />);
                                    }
                                 }}
                              >
                                 {t(L.PlayerTradeFill)}
                              </div>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </fieldset>
   );
}

function PendingClaimComponent({ pendingClaims }: { pendingClaims: IPendingClaim[]; building: IBuildingData }) {
   if (pendingClaims.length == 0) {
      return null;
   }
   return (
      <>
         <div className="table-view">
            <table>
               <tr>
                  <th>{t(L.PlayerTradeResource)}</th>
                  <th>{t(L.PlayerTradeFillBy)}</th>
                  <th className="text-right">{t(L.PlayerTradeAmount)}</th>
                  <th></th>
               </tr>
               {pendingClaims.map((trade) => {
                  return (
                     <tr key={trade.id}>
                        <td>{Tick.current.resources[trade.resource as Resource].name()}</td>
                        <td>{trade.fillBy}</td>
                        <td className="text-right">
                           <FormatNumber value={trade.amount} />
                        </td>
                        <td className="text-right text-strong text-link">
                           <span>{t(L.PlayerTradeClaim)}</span>
                        </td>
                     </tr>
                  );
               })}
            </table>
         </div>
         <div className="sep10"></div>
      </>
   );
}