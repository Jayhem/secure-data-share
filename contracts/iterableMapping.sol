
pragma solidity ^0.5.0;
/// @dev Models a address -> bool mapping where it is possible to iterate over all keys.
library IterableMapping
{
  struct itmap
  {
    mapping(address => IndexValue) data;
    KeyFlag[] keys;
    uint size;
  }
  struct IndexValue { uint keyIndex; bool value; }
  struct KeyFlag { address key; bool deleted; }
  function insert(itmap storage self, address key, bool value) public returns (bool replaced)
  {
    uint keyIndex = self.data[key].keyIndex;
    self.data[key].value = value;
    if (keyIndex > 0)
      return true;
    else
    {
      keyIndex = self.keys.length++;
      self.data[key].keyIndex = keyIndex + 1;
      self.keys[keyIndex].key = key;
      self.size++;
      return false;
    }
  }
  function remove(itmap storage self, address key) public returns (bool success)
  {
    uint keyIndex = self.data[key].keyIndex;
    if (keyIndex == 0)
      return false;
    delete self.data[key];
    self.keys[keyIndex - 1].deleted = true;
    self.size --;
  }
  function contains(itmap storage self, address key) public view returns (bool)
  {
    return self.data[key].keyIndex > 0;
  }
  function iterate_start(itmap storage self) public view returns (uint keyIndex)
  {
    return iterate_next(self, uint(-1));
  }
  function iterate_valid(itmap storage self, uint keyIndex) public view returns (bool)
  {
    return keyIndex < self.keys.length;
  }
  function iterate_next(itmap storage self, uint keyIndex) public view returns (uint r_keyIndex)
  {
    uint keyIndexToFind = keyIndex;
    keyIndexToFind++;
    while (keyIndexToFind < self.keys.length && self.keys[keyIndexToFind].deleted)
      keyIndexToFind++;
    return keyIndexToFind;
  }
  function iterate_get(itmap storage self, uint keyIndex) public view returns (address key, bool value)
  {
    key = self.keys[keyIndex].key;
    value = self.data[key].value;
  }
}