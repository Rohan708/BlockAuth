// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AccessControlContract
 * @author [Your Name/Team Name]
 * @notice This contract manages Decentralized Identifiers (DIDs) and enforces
 * Role-Based Access Control (RBAC) for a simulated IoT network.
 * @dev This is the final design blueprint for the core on-chain logic.
 */
contract AccessControlContract {

    //================================================================
    // State Variables
    //================================================================

    address public owner; // The address that deployed the contract, the first admin.

    // A structure to hold information about each registered entity (user or device).
    struct Identity {
        address walletAddress; // The unique Ethereum address of the device/user.
        string name;           // A human-readable name for easier identification (e.g., "Living Room Camera").
        string role;           // The assigned role, e.g., "Admin", "Device_Camera", "User_Family".
        bool isRegistered;     // A flag to check if the identity is active and registered.
        uint256 registrationDate; // Timestamp of when the identity was registered.
    }

    // Mapping from an Ethereum address to its full Identity struct.
    // This acts as our decentralized identity registry.
    mapping(address => Identity) public identityRegistry;

    // Mapping to define access permissions.
    // Format: mapping(address_of_requester => mapping(address_of_resource => boolean_permission))
    // Example: accessPermissions[camera_address][storage_address] = true;
    mapping(address => mapping(address => bool)) public accessPermissions;

    //================================================================
    // Events
    //================================================================

    /**
     * @notice Emitted when a new identity is successfully registered.
     * @param entityAddress The address of the newly registered entity.
     * @param role The role assigned to the new entity.
     */
    event IdentityRegistered(address indexed entityAddress, string role);

    /**
     * @notice Emitted for every access attempt to create an immutable audit trail.
     * @param requester The address that initiated the access request.
     * @param resource The address of the resource being accessed.
     * @param isSuccess True if access was granted, false otherwise.
     * @param timestamp The time of the access attempt.
     */
    event AccessAttempt(
        address indexed requester,
        address indexed resource,
        bool isSuccess,
        uint256 timestamp
    );


    //================================================================
    // Modifiers
    //================================================================

    /**
     * @dev A modifier to restrict function access to only addresses with the "Admin" role.
     */
    modifier onlyAdmin() {
        require(
            keccak256(bytes(identityRegistry[msg.sender].role)) == keccak256(bytes("Admin")),
            "ACCESS_CONTROL: Caller is not an admin."
        );
        _;
    }


    //================================================================
    // Constructor
    //================================================================

    /**
     * @dev The constructor is called only once when the contract is deployed.
     * It sets the deployer of the contract as the first "Admin".
     */
    constructor() {
        owner = msg.sender;
        identityRegistry[msg.sender] = Identity({
            walletAddress: msg.sender,
            name: "Initial Admin",
            role: "Admin",
            isRegistered: true,
            registrationDate: block.timestamp
        });
        emit IdentityRegistered(msg.sender, "Admin");
    }


    //================================================================
    // Core Functions
    //================================================================

    /**
     * @notice Registers a new device or user with a specific role.
     * @dev Can only be called by an address that already has the "Admin" role.
     * @param _newAddress The address of the new entity to register.
     * @param _name A human-readable name for the entity.
     * @param _role The role to be assigned (e.g., "Device_Camera", "User_Family").
     */
    function registerIdentity(address _newAddress, string memory _name, string memory _role) public onlyAdmin {
        require(_newAddress != address(0), "ACCESS_CONTROL: Cannot register the zero address.");
        require(!identityRegistry[_newAddress].isRegistered, "ACCESS_CONTROL: Address is already registered.");

        identityRegistry[_newAddress] = Identity({
            walletAddress: _newAddress,
            name: _name,
            role: _role,
            isRegistered: true,
            registrationDate: block.timestamp
        });

        emit IdentityRegistered(_newAddress, _role);
    }

    /**
     * @notice Grants a device/user permission to access a specific resource.
     * @dev Can only be called by an "Admin".
     * @param _requester The address of the entity that will be requesting access.
     * @param _resource The address of the resource they are being granted access to.
     */
    function grantAccess(address _requester, address _resource) public onlyAdmin {
        require(identityRegistry[_requester].isRegistered, "ACCESS_CONTROL: Requester is not a registered identity.");
        require(identityRegistry[_resource].isRegistered, "ACCESS_CONTROL: Resource is not a registered identity.");

        accessPermissions[_requester][_resource] = true;
    }

    /**
     * @notice Revokes a device/user's permission to access a specific resource.
     * @dev Can only be called by an "Admin".
     * @param _requester The address of the entity whose access is being revoked.
     * @param _resource The address of the resource they are losing access to.
     */
    function revokeAccess(address _requester, address _resource) public onlyAdmin {
        accessPermissions[_requester][_resource] = false;
    }

    /**
     * @notice A device calls this function to request access to a resource.
     * @dev This is the primary function for access validation. It checks permissions
     * and logs every attempt, successful or not.
     * @param _resource The address of the resource being requested.
     * @return A boolean indicating if access was granted.
     */
    function requestAccess(address _resource) public returns (bool) {
        // The entity calling this function is the requester.
        address requester = msg.sender;

        // Check if the requester is registered in the system.
        if (!identityRegistry[requester].isRegistered) {
            emit AccessAttempt(requester, _resource, false, block.timestamp);
            return false;
        }

        // Check the permissions mapping for access rights.
        bool hasPermission = accessPermissions[requester][_resource];

        // Log the attempt. This happens regardless of the outcome.
        emit AccessAttempt(requester, _resource, hasPermission, block.timestamp);

        return hasPermission;
    }
}
