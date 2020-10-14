```js
 const userContent = [];
 const allDataDict={"0":{"metadata":{"title":"new content","encrypted_data":"hello there"},"owner_key":[-471310535,-691296688,1042520733,-1362027459],"user_keys":[]},"1":{"metadata":{"title":"to test with Tenderly","encrypted_data":"asrtatat"},"owner_key":[-1583015985,1334641412,-448591950,1724637776],"user_keys":[]},"2":{"metadata":{"title":"content title 3","encrypted_data":"Here is the data I want to protect"},"owner_key":[-1696095330,-1613620499,-53516470,-688785480],"user_keys":[]},"3":{"metadata":{"title":"content 3","encrypted_data":"Here is the secret content"},"owner_key":[-1931473914,187835863,1742956126,-1608052962],"user_keys":[]},"4":{"metadata":{"title":"5th content","encrypted_data":"entianornierntiatrart"},"owner_key":[-143334636,421145866,-838514704,-1172392049],"user_keys":[]},"5":{"metadata":{"title":"6th contetn","encrypted_data":"enoenonarstar"},"owner_key":[-1248858956,1726884908,2012667861,629037362],"user_keys":[]}};
 const contractReady=true;
 const dataDict={"QmeYNDYiwLxcmUetCQ2Z3TGDq5gdJg1rPYCjdS6qaoPhyc":0,"QmPer5fSLbKpZY1vo9YnUsrNoByNVJD8PSZVRn2C4D3HVV":1,"QmUwLhzGLCkWED7zdLA7PvXJnuUVAcriyrWyiRnshgc2A7":2,"QmWGfQTemXoWc6z7tXzRahbA2HNAXfm46AJGmtjYgPQJVG":3,"QmVrRzLktcmXnbXzbPTVCc9BFhEjPnhHratL8VsRuADegR":4,"QmYHhB7DD98KvAZ5CwuTYoCXxBoowpg1fpLsKw63ZmFfAV":5};
const ownerData = [[0,"QmeYNDYiwLxcmUetCQ2Z3TGDq5gdJg1rPYCjdS6qaoPhyc"],[1,"QmPer5fSLbKpZY1vo9YnUsrNoByNVJD8PSZVRn2C4D3HVV"],[2,"QmUwLhzGLCkWED7zdLA7PvXJnuUVAcriyrWyiRnshgc2A7"],[3,"QmWGfQTemXoWc6z7tXzRahbA2HNAXfm46AJGmtjYgPQJVG"],[4,"QmVrRzLktcmXnbXzbPTVCc9BFhEjPnhHratL8VsRuADegR"],[5,"QmYHhB7DD98KvAZ5CwuTYoCXxBoowpg1fpLsKw63ZmFfAV"]];
 
<FullContentModal
key = "fullcontentModal"
className="modal-dialog-centered"
isOpen="true"
contentSelected="0"
contractReady={contractReady} 
allDataDict={allDataDict}
ownerData={ownerData}
toggleFullModal={null}
/>
```