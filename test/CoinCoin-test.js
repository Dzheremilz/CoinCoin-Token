const { expect } = require('chai')

describe('CoinCoin Token', function () {
  let CoinCoin, coincoin, dev, owner, alice, bob, charlie, dan, eve
  const NAME = 'CoinCoin'
  const SYMBOL = 'COIN'
  const INITIAL_SUPPLY = ethers.utils.parseEther('8000000000')

  beforeEach(async function () {
    ;[dev, owner, alice, bob, charlie, dan, eve] = await ethers.getSigners()
    CoinCoin = await ethers.getContractFactory('CoinCoin')
    coincoin = await CoinCoin.connect(dev).deploy(owner.address, INITIAL_SUPPLY)
    await coincoin.deployed()
    /*
    Il faudra transférer des tokens à nos utilisateurs de tests lorsque la fonction transfer sera implementé
    */
    await coincoin.connect(owner).transfer(alice.address, ethers.utils.parseEther('100000000'))
  })

  describe('Deployement', function () {
    it('Has name CoinCoin', async function () {
      expect(await coincoin.name()).to.equal(NAME)
    })
    it('Has symbol Coin', async function () {
      expect(await coincoin.symbol()).to.equal(SYMBOL)
    })
    it('mints initial Supply to owner', async function () {
      let coincoin = await CoinCoin.connect(dev).deploy(
        owner.address,
        INITIAL_SUPPLY
      )
      expect(await coincoin.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY)
    })

    it('emits event Transfer when mint totalSupply', async function () {
      /*
        On peut tester si un event a été emit depuis une transaction particulière.
        Le problème c'est qu'une transaction de déploiement ne nous retourne pas la transaction
        mais l'instance du smart contract déployé.
        Pour récupérer la transaction qui déployé le smart contract il faut utilisé un l'attribut
        ".deployTransaction" sur l'instance du smart contract
      */
      let receipt = await coincoin.deployTransaction.wait()
      let txHash = receipt.transactionHash
      await expect(txHash)
        .to.emit(coincoin, 'Transfer')
        .withArgs(ethers.constants.AddressZero, owner.address, INITIAL_SUPPLY)
    })
  })

  describe('Allowance system', function () {
    it('allow a spender to use owner tokens', async function () {
      await coincoin.connect(alice).approve(eve.address, 100000)
      expect(await coincoin.allowance(alice.address, eve.address)).to.equal(100000)
    })

    it('approve emits event', async () => {
      await expect(coincoin.approve(eve.address, 1000))
        .to.emit(coincoin, 'Approval')
        .withArgs(dev.address, eve.address, 1000)
    })
    /*
    it('should revert: from zero address', async function () {
      await expect(coincoin.connect(ethers.constants.AddressZero).approve(eve.address, 100000)).to.be.revertedWith('CoinCoin: approve from the zero address')
    })
    */

    it('should revert: to zero address', async function () {
      await expect(coincoin.approve(ethers.constants.AddressZero, 10000)).to.be.revertedWith('CoinCoin: approve to the zero address')
    })
  })

  describe('Token transfers', function () {
    it('transfers tokens from sender to receipient', async function () {
      await coincoin.connect(owner).transfer(eve.address, ethers.utils.parseEther('1000000'))
      expect(await coincoin.balanceOf(eve.address)).to.equal(ethers.utils.parseEther('1000000'))
    })

    it('emits event Transfer when transfer token', async function () {
      await expect(coincoin.connect(owner).transfer(eve.address, ethers.utils.parseEther('1000000')))
        .to.emit(coincoin, 'Transfer')
        .withArgs(owner.address, eve.address, ethers.utils.parseEther('1000000'))
    })

    it('should revert: to zero address', async function () {
      await expect(coincoin.transfer(ethers.constants.AddressZero, 10000)).to.be.revertedWith('CoinCoin: transfer to the zero address')
    })

    it('should revert: not enough Token', async function () {
      await expect(coincoin.transfer(eve.address, 10000)).to.be.revertedWith('CoinCoin: Not enough CoinCoin')
    })

    it('transferFrom tokens from sender to receipient', async function () {
      await coincoin.connect(alice).approve(eve.address, 100000)
      await coincoin.connect(eve).transferFrom(alice.address, dan.address, 10000)
      expect(await coincoin.balanceOf(dan.address)).to.be.equal(10000)
    })

    it('emits event Transfer when transferFrom token', async function () {
      await coincoin.connect(alice).approve(eve.address, 100000)
      await expect(coincoin.connect(eve).transferFrom(alice.address, dan.address, 10000))
        .to.emit(coincoin, 'Transfer')
        .withArgs(alice.address, dan.address, 10000)
    })

    it('emits event Approval when transferFrom token', async function () {
      await coincoin.connect(alice).approve(eve.address, 100000)
      await expect(coincoin.connect(eve).transferFrom(alice.address, dan.address, 10000))
        .to.emit(coincoin, 'Approval')
        .withArgs(alice.address, eve.address, 100000 - 10000)
    })

    it('should revert: from zero address', async function () {
      await expect(coincoin.connect(eve).transferFrom(ethers.constants.AddressZero, alice.address, 0)).to.be.revertedWith('CoinCoin: transfer from the zero address')
    })

    it('should revert: to zero address', async function () {
      await coincoin.connect(alice).approve(eve.address, 100000)
      await expect(coincoin.connect(eve).transferFrom(alice.address, ethers.constants.AddressZero, 10000)).to.be.revertedWith('CoinCoin: transfer to the zero address')
    })

    it('should revert: not enough token', async function () {
      await coincoin.connect(dan).approve(eve.address, 100000)
      await expect(coincoin.connect(eve).transferFrom(dan.address, charlie.address, 10000)).to.be.revertedWith('CoinCoin: Not enough CoinCoin')
    })

    it('should revert: transfer amount exceeds allowance', async function () {
      await coincoin.connect(alice).approve(eve.address, 100000)
      await expect(coincoin.connect(eve).transferFrom(alice.address, charlie.address, 1000000)).to.be.revertedWith('CoinCoin: transfer amount exceeds allowance')
    })
  })
})
