#!/usr/bin/env python
plist = open("build/darwin/x64/Rodeo-darwin-x64/Rodeo.app/Contents/Info.plist").read()
find = """  </dict>
</plist>"""
idx = plist.index(find)
doctypes = """    <key>CFBundleDocumentTypes</key>
    <array>
        <dict>
            <key>CFBundleTypeExtensions</key>
            <array>
                <string>py</string>
                <string>rpy</string>
                <string>cpy</string>
                <string>python</string>
            </array>
            <key>CFBundleTypeIconFile</key>
            <string>file.icns</string>
            <key>CFBundleTypeName</key>
            <string>Python source</string>
            <key>CFBundleTypeRole</key>
            <string>Editor</string>
            <key>LSHandlerRank</key>
            <string>Alternate</string>
        </dict>
    </array>
"""

with open("build/darwin/x64/Rodeo-darwin-x64/Rodeo.app/Contents/Info.plist", "wb") as f:
    f.write(plist[:idx] + doctypes + plist[idx:])
