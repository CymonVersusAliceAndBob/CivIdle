import { Tick } from "../logic/TickLogic";
import { usePlayerMap, useTrades } from "../rpc/RPCClient";
import { formatPercent } from "../utilities/Helper";
import { L, t } from "../utilities/i18n";
import { FillPlayerTradeModal } from "./FillPlayerTradeModal";
import { showModal } from "./GlobalModal";
import { MenuComponent } from "./MenuComponent";

export function PlayerTilePage({ xy }: { xy: string }) {
   const playerMap = usePlayerMap();
   const tile = playerMap[xy];
   if (!tile) {
      return null;
   }
   const trades = useTrades();
   return (
      <div className="window">
         <div className="title-bar">
            <div className="title-bar-text">{tile.handle}</div>
         </div>
         <MenuComponent />
         <div className="window-body">
            <fieldset>
               <legend>{tile.handle}</legend>
               <div className="row mv5">
                  <div className="f1">{t(L.PlayerMapTariff)}</div>
                  <div>{formatPercent(tile.tariffRate)}</div>
               </div>
               <div className="row mv5">
                  <div className="f1">{t(L.PlayerMapEstablishedSince)}</div>
                  <div>{new Date(tile.createdAt).toLocaleDateString()}</div>
               </div>
            </fieldset>
            <fieldset>
               <legend>{t(L.PlayerMapTradesFrom, { name: tile.handle })}</legend>
               <div className="table-view">
                  <table>
                     <tbody>
                        <tr>
                           <th>{t(L.PlayerTradeWant)}</th>
                           <th>{t(L.PlayerTradeOffer)}</th>
                           <th></th>
                        </tr>
                        {trades
                           .filter((t) => t.fromId == tile.userId)
                           .map((trade) => {
                              return (
                                 <tr key={trade.id}>
                                    <td>
                                       {Tick.current.resources[trade.buyResource].name()} x {trade.buyAmount}
                                    </td>
                                    <td>
                                       {Tick.current.resources[trade.sellResource].name()} x {trade.sellAmount}
                                    </td>
                                    <td>
                                       <div
                                          className="text-strong text-blue pointer"
                                          onClick={() => {
                                             showModal(<FillPlayerTradeModal trade={trade} />);
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
         </div>
      </div>
   );
}