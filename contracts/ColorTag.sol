// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ColorTag
 * @notice ColorTag allows users to choose a hexadecimal color and save it to their wallet address on-chain.
 * @dev Stores 6-digit hex colors formatted as #RRGGBB.
 */
contract ColorTag {
    // Mapping from wallet address to saved hex color string
    mapping(address => string) private _colors;

    // Mapping from wallet address to whether a color has been saved
    mapping(address => bool) private _hasColor;

    /**
     * @notice Emitted whenever a user saves or updates their color.
     * @param user The address of the wallet saving the color.
     * @param color The hex color string saved (e.g., "#FF5733").
     */
    event ColorSaved(address indexed user, string color);

    /**
     * @notice Validates that a string is a valid 6-digit hex color format (#RRGGBB).
     * @param color The color string to validate.
     * @return bool True if valid, false otherwise.
     */
    function isValidColor(string memory color) public pure returns (bool) {
        bytes memory b = bytes(color);
        // Must be exactly 7 characters: '#' followed by 6 hex characters
        if (b.length != 7) {
            return false;
        }

        // Must start with '#' (0x23 in ASCII)
        if (b[0] != 0x23) {
            return false;
        }

        // Validate remaining 6 characters are valid hex digits (0-9, a-f, A-F)
        for (uint256 i = 1; i < 7; i++) {
            bytes1 char = b[i];
            bool isDigit = (char >= 0x30 && char <= 0x39);       // 0-9
            bool isLowerHex = (char >= 0x61 && char <= 0x66);    // a-f
            bool isUpperHex = (char >= 0x41 && char <= 0x46);    // A-F

            if (!isDigit && !isLowerHex && !isUpperHex) {
                return false;
            }
        }

        return true;
    }

    /**
     * @notice Sets or updates the chosen color for the caller's wallet address.
     * @dev Validates format, stores the color, and emits ColorSaved event.
     * @param color The hexadecimal color string (e.g., "#3B82F6").
     */
    function setColor(string calldata color) external {
        require(isValidColor(color), "Invalid color format. Expected #RRGGBB");

        _colors[msg.sender] = color;
        _hasColor[msg.sender] = true;

        emit ColorSaved(msg.sender, color);
    }

    /**
     * @notice Returns the saved color for a specific wallet address.
     * @param user The wallet address to query.
     * @return string The hex color string if set, or an empty string if unset.
     */
    function getColor(address user) external view returns (string memory) {
        return _colors[user];
    }

    /**
     * @notice Returns whether a specific wallet address has saved a color.
     * @param user The wallet address to query.
     * @return bool True if the wallet has saved a color, false otherwise.
     */
    function hasColor(address user) external view returns (bool) {
        return _hasColor[user];
    }
}
