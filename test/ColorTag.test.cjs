const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ColorTag", function () {
  let colorTag;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const ColorTagFactory = await ethers.getContractFactory("ColorTag");
    colorTag = await ColorTagFactory.deploy();
    await colorTag.waitForDeployment();
  });

  describe("Initial State", function () {
    it("returns correct empty/default state for an unset wallet", async function () {
      expect(await colorTag.getColor(owner.address)).to.equal("");
      expect(await colorTag.hasColor(owner.address)).to.be.false;

      expect(await colorTag.getColor(addr1.address)).to.equal("");
      expect(await colorTag.hasColor(addr1.address)).to.be.false;
    });
  });

  describe("Saving and Updating Colors", function () {
    it("allows a wallet to save a valid color", async function () {
      const color = "#FF5733";
      await colorTag.connect(owner).setColor(color);

      expect(await colorTag.hasColor(owner.address)).to.be.true;
      expect(await colorTag.getColor(owner.address)).to.equal(color);
    });

    it("emits the ColorSaved event correctly when a color is saved", async function () {
      const color = "#3B82F6";
      await expect(colorTag.connect(owner).setColor(color))
        .to.emit(colorTag, "ColorSaved")
        .withArgs(owner.address, color);
    });

    it("allows a wallet to update its color at any time", async function () {
      const initialColor = "#10B981";
      const updatedColor = "#8B5CF6";

      await colorTag.connect(owner).setColor(initialColor);
      expect(await colorTag.getColor(owner.address)).to.equal(initialColor);

      await expect(colorTag.connect(owner).setColor(updatedColor))
        .to.emit(colorTag, "ColorSaved")
        .withArgs(owner.address, updatedColor);

      expect(await colorTag.getColor(owner.address)).to.equal(updatedColor);
      expect(await colorTag.hasColor(owner.address)).to.be.true;
    });

    it("allows different wallets to save different colors independently", async function () {
      const color1 = "#E11D48";
      const color2 = "#06B6D4";

      await colorTag.connect(addr1).setColor(color1);
      await colorTag.connect(addr2).setColor(color2);

      expect(await colorTag.getColor(addr1.address)).to.equal(color1);
      expect(await colorTag.hasColor(addr1.address)).to.be.true;

      expect(await colorTag.getColor(addr2.address)).to.equal(color2);
      expect(await colorTag.hasColor(addr2.address)).to.be.true;

      expect(await colorTag.getColor(owner.address)).to.equal("");
      expect(await colorTag.hasColor(owner.address)).to.be.false;
    });

    it("accepts valid lowercase, uppercase, and mixed hex values", async function () {
      await expect(colorTag.connect(owner).setColor("#abcdef")).to.not.be.reverted;
      expect(await colorTag.getColor(owner.address)).to.equal("#abcdef");

      await expect(colorTag.connect(owner).setColor("#ABCDEF")).to.not.be.reverted;
      expect(await colorTag.getColor(owner.address)).to.equal("#ABCDEF");

      await expect(colorTag.connect(owner).setColor("#1a2B3c")).to.not.be.reverted;
      expect(await colorTag.getColor(owner.address)).to.equal("#1a2B3c");
    });
  });

  describe("Validation and Error Handling", function () {
    it("rejects invalid color missing '#' prefix", async function () {
      await expect(colorTag.connect(owner).setColor("FF5733"))
        .to.be.revertedWith("Invalid color format. Expected #RRGGBB");
    });

    it("rejects 3-digit hex shorthand colors", async function () {
      await expect(colorTag.connect(owner).setColor("#FFF"))
        .to.be.revertedWith("Invalid color format. Expected #RRGGBB");
    });

    it("rejects colors that are too long (e.g., 8-digit hex with alpha)", async function () {
      await expect(colorTag.connect(owner).setColor("#FF5733AA"))
        .to.be.revertedWith("Invalid color format. Expected #RRGGBB");
    });

    it("rejects colors containing non-hex characters", async function () {
      await expect(colorTag.connect(owner).setColor("#GG1234"))
        .to.be.revertedWith("Invalid color format. Expected #RRGGBB");

      await expect(colorTag.connect(owner).setColor("#12345Z"))
        .to.be.revertedWith("Invalid color format. Expected #RRGGBB");

      await expect(colorTag.connect(owner).setColor("# 12345"))
        .to.be.revertedWith("Invalid color format. Expected #RRGGBB");

      await expect(colorTag.connect(owner).setColor("#!@#$%^"))
        .to.be.revertedWith("Invalid color format. Expected #RRGGBB");
    });

    it("rejects an empty string", async function () {
      await expect(colorTag.connect(owner).setColor(""))
        .to.be.revertedWith("Invalid color format. Expected #RRGGBB");
    });
  });
});
