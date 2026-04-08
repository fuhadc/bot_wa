import webbrowser
import sys
from config import DEFAULT_VENDOR, DEFAULT_MAPS_LINK
from generator import generate_message, generate_wa_link
from storage import save_log

def clear_screen():
    print("\033[H\033[J", end="")

def main():
    while True:
        clear_screen()
        print("=== WhatsApp Review Request Tool ===")
        print("Generate deep links for Google Maps reviews.\n")

        name = input("Customer Name: ").strip()
        if not name:
            print("Name is required.")
            input("Press Enter to continue...")
            continue

        phone = input("Phone Number (with country code, e.g., 919876543210): ").strip()
        if not phone:
            print("Phone number is required.")
            input("Press Enter to continue...")
            continue

        vendor = input(f"Vendor Name [default: {DEFAULT_VENDOR}]: ").strip() or DEFAULT_VENDOR
        maps_link = input(f"Google Maps Review Link [default: {DEFAULT_MAPS_LINK}]: ").strip() or DEFAULT_MAPS_LINK

        message = generate_message(name, vendor, maps_link)
        wa_link = generate_wa_link(phone, message)

        print("\n--- Generated Message ---")
        print(message)
        print("\n--- WhatsApp Link ---")
        print(wa_link)
        print("\n--------------------------")

        choice = input("\nOpen link in browser? (Y/n): ").strip().lower()
        
        if choice in ('y', ''):
            try:
                webbrowser.open(wa_link)
                save_log(phone, name, vendor, "opened")
                print("\n✅ Link opened and logged.")
            except Exception as e:
                save_log(phone, name, vendor, "failed")
                print(f"\n❌ Error opening browser: {e}")
                print("Log saved with 'failed' status.")
        else:
            print("\nOperation cancelled. No log saved.")

        repeat = input("\nProcess another customer? (Y/n): ").strip().lower()
        if repeat == 'n':
            print("\nExiting. Thank you!")
            break

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nExiting... Bye!")
        sys.exit(0)
