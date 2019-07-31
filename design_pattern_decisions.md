# Design pattern decisions
The main pattern that was required was that of the owner. The content is owned by the contract deployer and can only be shared by the owner. In order to implement it, I used Open Zeppelin's ownable contract. My contract extends ownable, thus uses code that was audited and should provide a secure way of handling the functions that manage the content access requests and the content creation.

Note that I tried installing the Open Zeppelin contracts with ethpm, but if fails, so I resorted to the npm install method.
