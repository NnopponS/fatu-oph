import type { RealmKey } from "@/lib/realms";

// Original low-resolution pixel sprites; every square stays crisp at any scale.
const sprites:Record<RealmKey,string[]>={
  "azure-dragon":[
    "....gg........gg....","....gy........yg....",".....yy......yy.....",".....tttttttttt.....","....tLLLLLLLLLLt....","...tLLtLLLLLLtLLt...","..tLLLLLLLLLLLLLLt..","..tLLwwLLLLLLwwLLt..","..tLLbkLLLLLLkbLLt..","...tLLLLLLLLLLLLt...","..yyttLLggggLLttyy..",".y...tLLLttLLLt...y.",".....ttLLLLLLtt.....","...tttLLLLLLLLttt...","..tLLtLLggggLLtLLt..","..tLLtLLgyygLLtLLt..","...tttLLggggLLttt...","....tLLLLLLLLLLt....",".....tttttttttt...t.",".....tLLt..tLLt..tLt","....ttttt..ttttt.tt.",
  ],
  "white-tiger":[
    "...gg..........gg...","..gWWg........gWWg..","..gWWggggggggggWWg..","...gWWWWWWWWWWWWg...","..gWWkkWWkkWWkkWWg..",".gWWWWWWWWWWWWWWWWg.",".gkkWWWWWWWWWWWWkkg.",".gWWWwwWWWWWWwwWWWg.",".gWWWbkWWWWWWkbWWWg.",".gkkWWWWggggWWWWkkg.","..gWWWggWkkWggWWWg..","...ggWWWWkkWWWWgg...",".....gggggggggg.....","...ggWWWWWWWWWWgg...","..gWWgWWkkkkWWgWWg..","..gWWgWWWWWWWWgWWg..","...gggWWggggWWggg...","....gWWWggggWWWg....",".....gggggggggg..gg.",".....gWWg..gWWg.gWWg","....ggggg..ggggg.gg.",
  ],
  "nine-tailed-fox":[
    "...pp..........pp...","...pWp........pWp...","...pWWppppppppWWp...","....pWWWWWWWWWWp....","...pWWppppppppWWp...","..pWWppLLLLLLppWWp..","..pWWpLLLLLLLLpWWp..","..pWWpwwLLLLwwpWWp..","...ppLbkLLLLkbLpp...","....pLLLppppLLLp....",".....pWWLkkLWWp.....",".pp...pWWWWWWp...pp.","pLWp...pppppp...pWLp","pLLWp..pLLLLp..pWLLp",".pLLWp.pLggLp.pWLLp.","..pLLpppLyyLpppLLp..","pp.pLLpLLggLLpLLp.pp","pWWppLLppppppLLppWWp",".pWWWppLLLLLLppWWWp.","..pppppLLLLLLppppp..","....pppppppppppp....",
  ],
  "red-phoenix":[
    ".........yy.........","........yry.........",".......ryyr.........",".......rLLLLr.......","......rLLLLLLr......",".....rLLwwwwLLr.....",".....rLLbk kbLr.....","......rLLyyLLr......",".yy....rLyyLr....yy.","yrLy...rrrrrr...yLry","yrLLryrLLLLLLryrLLry",".yrLLLLLLggLLLLLLry.","..yrLLLLgyygLLLLry..","...yrLLLLggLLLLry...","....rrrrLLLLrrrr....","......rLLLLLLr......",".......rrLLrr.......","......yryLLyry......",".....yrLryyrLry.....","......yyy..yyy......",".......y....y.......",
  ],
};
const palettes:Record<RealmKey,Record<string,string>>={
  "azure-dragon":{t:"#134846",L:"#3ccabb",g:"#8a6429",y:"#ffe397",w:"#fffcdf",b:"#082d30",k:"#173635"},
  "white-tiger":{g:"#39556b",W:"#fff4dc",k:"#526576",w:"#f4bc56",b:"#182c3c"},
  "nine-tailed-fox":{p:"#703e76",W:"#fff3e3",L:"#ec9cc2",g:"#93642b",y:"#ffdf79",w:"#fff7e5",b:"#273443",k:"#624367"},
  "red-phoenix":{r:"#852e2e",L:"#f4774c",y:"#fbc75c",g:"#914229",w:"#fff0ce",b:"#302333",k:"#5b2727"},
};
export function PixelGuardian({realm,className=""}:{realm:RealmKey;className?:string}) {
  const rows=sprites[realm];const width=Math.max(...rows.map(row=>row.length));
  return <svg className={`pixel-guardian ${className}`} viewBox={`0 0 ${width} ${rows.length+2}`} shapeRendering="crispEdges" aria-hidden="true"><ellipse cx={width/2} cy={rows.length+1} rx="6" ry="1" fill="#173c3425" /><g className="pixel-guardian-body">{rows.flatMap((row,y)=>[...row].map((pixel,x)=>palettes[realm][pixel]?<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={palettes[realm][pixel]} />:null))}</g></svg>;
}
