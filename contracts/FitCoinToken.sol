pragma solidity >=0.4.22 <0.9.0;

contract FitCoinToken {
    //Name
    string public name = "FitCoin Token";
    //Symbol
    string public symbol = "FTC";
    //Standard
    string public standard = "FitCoin Token v1.0";
    //Total Supply
    uint256 public totalSupply;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
            );

    event Approval(

        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
    
    mapping (address=>uint256) public balanceOf;
    mapping (address=>mapping(address=>uint256)) public allowance;

    constructor (uint256 _initialSupply) {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
            }

    //Transfer
    function transfer(address _to, uint256 _value) public payable returns (bool success){
        require (balanceOf[msg.sender] >= _value, "Transfer failed due to insufficient funds, revert the transfer");
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;        
    }

    //Approve 
    function approve(address _spender, uint256 _value) public returns (bool success){
        //Allowance
        
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
    
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
    
    
    //Require _from to have enough tokens
    require (balanceOf[_from] >= _value, "Transfer failed due to insufficient funds, revert the transfer");
        
    //Require allowance to be bigger than value
    require (allowance[_from][msg.sender] >= _value, "Transfer failed due to insufficient allowance, revert the transfer");
    
    //Change the balance
    balanceOf[_from] -= _value;
    balanceOf[_to] += _value;
    // Update the allowance
    allowance[_from][msg.sender] -= _value;
    //Transfer Event
    emit Transfer(_from, _to, _value);
    //return boolean
    return true;
    }
}