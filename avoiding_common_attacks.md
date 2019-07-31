# Avoiding common attacks
The first thing I did was to run the MythX Truffle plugin to verify my contract.
Only the floating pragma warning was returned, so good start there.
As my contract does not deal with sending Ether, or calling external contracts most of the common attacks cannot occur.
Let's see below each of them.

## Re-entrancy Attacks
There is no external call, therefore no re-entrancy attack is possible on the contract.

## Transaction Ordering and Timestamp Dependence
There is no advantage for an attacker to have their transaction processed earlier than another one.

## Integers can underflow or overflow in the EVM.
This could be an attack vector in my contract, so I looked at the data stucture design closely.
All the data structures are mappings except for the data_index. Mappings are not subject to underflow or overflow attacks.
The user can provide the data_id, which is bounded by the data_index internal UINT variable.
However, there is no function 'user' function that can modify the data_id, only the owner can add content, thus increas the data_index variable.

## Denial of Service
There is no call to external contracts, so denial of service is not possible.

## Denial of Service by Block Gas Limit (or startGas)
The contract owner can react to requests made by users and will incur a cost to granting or refusing access, but the gas consumption is deterministic for each function that is not a view.
