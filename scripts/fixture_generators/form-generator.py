fieldLabel = ['Name', 'Address', 'Phone', 'Email', 'URL', 'Number of Days', 'Amount']
filedIds = ['name', 'address', 'phone', 'email', 'url', 'numberOfDays', 'amount']
val = ['','','phone', 'email', 'url', 'number','decimal']

for i, id in enumerate(filedIds):
    label = fieldLabel[i]
    v = val[i]
    validator = ''
    if v != '':
        validator = 'ad-val-' + v
    print '''
<div class="ad-control-group" ad-control-group>
    <label for="" class="ad-label" ad-label="%s">%s</label>
    <div class="ad-controls">
        <input type="text" ad-val ad-val-required %s>
    </div>
    <div class="ad-details" ad-message-show style="display: none"></div>
</div>
''' % (label, label, validator)
