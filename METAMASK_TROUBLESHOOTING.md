# 🔧 MetaMask Connection Troubleshooting

## ❌ **Common Error: "Failed to connect to MetaMask"**

### **Quick Fixes (Try These First):**

## **1. ✅ Refresh the Page**
- **Press `Ctrl+F5`** (hard refresh)
- **Clear browser cache** if needed

## **2. ✅ Check MetaMask Extension**
- **Click MetaMask icon** in browser toolbar
- **Ensure it's unlocked** and shows accounts
- **Try connecting manually** from MetaMask

## **3. ✅ Check Network Settings**
- **Must be on "Localhost 8545"** 
- **Chain ID: 1337**
- **RPC URL: http://127.0.0.1:8545**

---

## 🔍 **Detailed Troubleshooting Steps:**

### **Step 1: Verify MetaMask Installation**
```
✅ MetaMask icon visible in browser toolbar
✅ Extension is enabled (not disabled)
✅ MetaMask version is recent (update if old)
```

### **Step 2: Check Account Status**
```
✅ MetaMask is unlocked (enter password if locked)
✅ At least one account exists
✅ Account has some ETH for gas (even 0.1 ETH is enough)
```

### **Step 3: Network Configuration**
```
✅ Network Name: "Localhost 8545"
✅ RPC URL: http://127.0.0.1:8545
✅ Chain ID: 1337
✅ Currency: ETH
```

### **Step 4: Test Network Connection**
```bash
# Make sure Hardhat node is running:
npx hardhat node

# Should show:
# Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

---

## 🚨 **Specific Error Solutions:**

### **Error: "User denied account access"**
**Solution:** Click "Connect" in MetaMask popup, don't reject it

### **Error: "Already processing eth_requestAccounts"**
**Solution:** 
1. Open MetaMask
2. Go to Settings → Advanced → Reset Account
3. Refresh browser page
4. Try connecting again

### **Error: "Network error" or "Cannot connect"**
**Solution:**
1. Check Hardhat node is running: `npx hardhat node`
2. Verify localhost:8545 is accessible
3. Try switching networks and back to localhost

### **Error: "Chain ID mismatch"**
**Solution:**
1. Delete localhost network from MetaMask
2. Re-add with exact settings:
   - Chain ID: 1337 (not 31337 or other)
   - RPC: http://127.0.0.1:8545

---

## 🔄 **Complete Reset Process:**

### **If Nothing Works, Do This:**

1. **Reset MetaMask Account:**
   - MetaMask → Settings → Advanced → Reset Account
   - Confirm reset

2. **Clear Browser Data:**
   - Browser → Settings → Privacy → Clear browsing data
   - Select "Cookies" and "Cached images/files"

3. **Restart Everything:**
   ```bash
   # Stop all processes
   Ctrl+C (in all terminals)
   
   # Restart Hardhat node
   npx hardhat node
   
   # Restart frontend (new terminal)
   cd frontend && npm start
   ```

4. **Re-add Network:**
   - Add localhost network with exact settings above

5. **Import Test Account:**
   ```
   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

---

## ✅ **Success Indicators:**

### **When Everything Works, You'll See:**
- ✅ **MetaMask shows**: "Localhost 8545" network
- ✅ **Account balance**: 1,000+ ETH (your test account)
- ✅ **dApp shows**: "Connected to MetaMask" with green indicator
- ✅ **Contract Debugger**: All contracts show success status
- ✅ **No error messages** in browser console

---

## 📞 **Still Having Issues?**

### **Check Browser Console:**
1. **Press F12** (open developer tools)
2. **Go to Console tab**
3. **Look for error messages** (red text)
4. **Common fixes:**
   - `net::ERR_CONNECTION_REFUSED` → Start Hardhat node
   - `MetaMask not found` → Install/enable extension
   - `User rejected request` → Approve connection in MetaMask

### **Network Connectivity Test:**
Open browser and go to: `http://127.0.0.1:8545`
- **Should show:** JSON-RPC server response
- **If error:** Hardhat node not running

---

## 🎯 **Final Checklist:**

Before asking for help, verify:
- [ ] MetaMask extension installed and unlocked
- [ ] Localhost 8545 network added with Chain ID 1337
- [ ] Test account imported with 1,000+ ETH balance
- [ ] Hardhat node running (`npx hardhat node`)
- [ ] Frontend running (`cd frontend && npm start`)
- [ ] Browser at `http://localhost:3000`
- [ ] No error messages in console (F12)

**When all boxes are ✅, MetaMask should connect perfectly! 🎉**


