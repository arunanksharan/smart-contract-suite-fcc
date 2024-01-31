// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

interface tokenRecipient {
    function receiveApproval(
        address _from,
        uint256 _value,
        address _token,
        bytes calldata _extraData
    ) external;
}

contract ManualToken {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    // 18 decimals is the strongly suggested default, avoid changing it
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    // Allowance of mapping - which address allowed to take how many tokens
    // ||||||Owner||||||||||AllowedSpender||Amount|||||||
    mapping(address => mapping(address => uint256)) public allowance;

    // Events
    // A token contract which creates new tokens => fire an event with from address set to 0x0
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Approval event - fire when approve function is called
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    // This notifies clients about the amount burnt
    event Burn(address indexed from, uint256 value);

    // |||||| Details of the Token |||||||
    // Getter Functions are provided by default for the state variables by solidity
    // function name() public view returns (string memory) {
    //     return tokenName;
    // }

    // function symbol() public view returns (string memory) {
    //     return tokenSymbol;
    // }

    // function decimals() public view returns (uint8) {
    //     return tokenDecimals;
    // }

    // function totalSupply() public view returns (uint256) {
    //     return tokenTotalSupply;
    // }

    // ||||||| Balance of queried account |||||||
    // function balanceOf(
    //     address _owner
    // ) public view returns (uint256 balance) {
    //     return balanceOf[_owner];
    // }

    // ||||||| Constructor |||||||

    constructor(
        uint256 initialSupply,
        string memory tokenName,
        string memory tokenSymbol
    ) {
        totalSupply = initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply; // Give the creator all initial tokens
        name = tokenName; // Set the name for display purposes
        symbol = tokenSymbol; // Set the name for display purposes
    }

    // transfer tokens - subtract from address amount & add to the recipient address
    // Must fire transfer event & should throw if message caller's account balance does not have enough tokens to spend
    // transfer of 0 values must be treated as normal transfer & fire event
    /**
     * Internal transfer, only can be called by this contract
     */
    function _transfer(address _from, address _to, uint _value) internal {
        // Prevent transfer to 0x0 - use Burn instead
        require(_to != address(0x0));

        // Check if the sender has enough
        require(balanceOf[_from] >= _value);

        // Check for overflows
        require(balanceOf[_to] + _value >= balanceOf[_to]);

        // Save this for an assertion in the future
        uint previousBalances = balanceOf[_from] + balanceOf[_to];

        // Subtract from the sender
        balanceOf[_from] -= _value;

        // Add the same to the recipient
        balanceOf[_to] += _value;

        // Emit transfer event
        emit Transfer(_from, _to, _value);

        // Asserts are used to use static analysis to find bugs in your code. They should never fail
        // If these asserts are hit, it's because of a bug in the contract
        assert(balanceOf[_from] + balanceOf[_to] == previousBalances);
    }

    /**
     * Transfer tokens
     *
     * Send `_value` tokens to `_to` from your account
     *
     * @param _to The address of the recipient
     * @param _value the amount to send
     */
    function transfer(
        address _to,
        uint256 _value
    ) public returns (bool success) {
        _transfer(msg.sender, _to, _value); // Call the internal transfer function
        return true;
    }

    // transferFrom checks allowance mapping - did owner give you allowance to spend those tokens?
    // The transferFrom method is used for a withdraw workflow, allowing contracts to transfer tokens on your behalf & charge fees in sub-currencies.
    /**
     * Transfer tokens from other address
     *
     * Send `_value` tokens to `_to` on behalf of `_from`
     *
     * @param _from The address of the sender
     * @param _to The address of the recipient
     * @param _value the amount to send
     */

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        // Check the value being transferred is less than the allowance made by the owner (from) for msg.sender (to) address
        require(_value <= allowance[_from][msg.sender]);
        allowance[_from][msg.sender] -= _value; // Reduce the allowance by the amount being transferred
        _transfer(_from, _to, _value); // Call the transfer function
        return true;
    }

    // To allow some other smart contract to work with our tokens
    // Allows _spender to withdraw from your account multiple times upto the approved _value amount
    /**
     * Set allowance for other address
     *
     * Allows `_spender` to spend no more than `_value` tokens on your behalf
     *
     * @param _spender The address authorized to spend
     * @param _value the max amount they can spend
     */
    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        allowance[msg.sender][_spender] = _value; // Set the allowance
        emit Approval(msg.sender, _spender, _value); // Fire the approval event
        return true;
    }

    // Allowance - returns the amount which the spender is still alowed to withdraw from the owner
    /**
     * Set allowance for other address and notify
     *
     * Allows `_spender` to spend no more than `_value` tokens on your behalf, and then ping the contract about it
     *
     * @param _spender The address authorized to spend
     * @param _value the max amount they can spend
     * @param _extraData some extra information to send to the approved contract
     */

    function approveAndCall(
        address _spender,
        uint256 _value,
        bytes memory _extraData
    ) public returns (bool success) {
        tokenRecipient spender = tokenRecipient(_spender); // Cast the _spender address to the tokenRecipient interface

        if (approve(_spender, _value)) {
            spender.receiveApproval(
                msg.sender,
                _value,
                address(this),
                _extraData
            ); // Call the receiveApproval function on the contract you want to be notified. This crafts the function signature manually so one doesn't have to include a contract in here just for this.
            return true;
        }
    }

    /**
     * Destroy tokens
     *
     * Remove `_value` tokens from the system irreversibly
     *
     * @param _value the amount of money to burn
     */
    function burn(uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value); // Check if the sender has enough
        balanceOf[msg.sender] -= _value; // Subtract from the sender
        totalSupply -= _value; // Updates totalSupply
        emit Burn(msg.sender, _value);
        return true;
    }

    /**
     * Destroy tokens from other account
     *
     * Remove `_value` tokens from the system irreversibly on behalf of `_from`.
     *
     * @param _from the address of the sender
     * @param _value the amount of money to burn
     */
    function burnFrom(
        address _from,
        uint256 _value
    ) public returns (bool success) {
        require(balanceOf[_from] >= _value); // Check if the targeted balance is enough
        require(_value <= allowance[_from][msg.sender]); // Check allowance
        balanceOf[_from] -= _value; // Subtract from the targeted balance
        allowance[_from][msg.sender] -= _value; // Subtract from the sender's allowance
        totalSupply -= _value; // Update totalSupply
        emit Burn(_from, _value);
        return true;
    }
}
